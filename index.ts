import { Anuncio, Carrinho, ListaDeDesejos, Oferta, PrismaClient, User } from "@prisma/client";
import { Request, Response } from 'express';

const prisma = new PrismaClient();
const express = require('express');

const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(bodyParser.json());

async function main() {

  const users: User[] = await prisma.user.findMany()
  const anuncios: Anuncio[] = await prisma.anuncio.findMany();
  const ofertas:Oferta[] = await prisma.oferta.findMany();
  const wishList:ListaDeDesejos[] = await prisma.listaDeDesejos.findMany();
  const carts:Carrinho[] = await prisma.carrinho.findMany();

  console.log('Usuários')
  console.table(users)
  console.log('Lista de Desejos')
  console.table(wishList)
  console.log('Anúncios')
  console.table(anuncios)
  console.log('Ofertas')
  console.table(ofertas)
  console.log('Carrinhos')
  console.table(carts)
  
}


app.get('/search', async (req: any, res: any) => {
  // Recupera os critérios de pesquisa dos parâmetros da query
  const { query, modalidade, categoria, localizacao, estadoProduto } = req.query;

  try {
    // Realiza a pesquisa no banco de dados
    const results = await prisma.anuncio.findMany({
      where: {
        AND: [{
          OR: [
            {
              titulo: {
                contains: query as string,
              },
            },
            {
              descricao: {
                contains: query as string,
              },
            },
          ]
        },
        ...(modalidade
          ? [{
            trocaTemporaria: modalidade === 'temporaria',
          }]
          : []),
        ...(localizacao ? [{
          localizacao: {
            equals: localizacao as string,
          }
        }] : []),
        ...(estadoProduto ? [{
          estadoProduto: {
            equals: estadoProduto as string,
          },
        }] : []),
        ...(categoria ? [{
          categoria: {
            equals: categoria as string,
          },
        }] : []),
        {
          estaAberto: {
            equals: true
          }
        }
        ],
       
      },
    });

    // Retorna os resultados da pesquisa
    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao realizar a pesquisa' });
  }
});


app.post('/login', async (req: any, res: any) => {
  try {

    const { email, senha } = req.body;

    const user = await prisma.user.findUnique({
      where: {
        email: email,
        senha: senha
      }
    });

    if (!user) {
      return res.status(401).json({ message: 'Usuário ou senha incorretos' });
    }

    console.log('Chamada feita com sucesso');
    return res.status(200).json(user);
  }
  catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Busca informações de um usuário
app.get('/user/:uid', async (req: any, res: any) => {
  const uid = parseInt(req.params.uid);

  // Verifica se o uid é um número válido
  if (isNaN(uid)) {
    return res.status(400).json({ error: 'O ID do usuário deve ser um número' });
  }

  try {
    // Busca o usuário e seus anúncios associados
    const user = await prisma.user.findUnique({
      where: { id: uid },
      include: { anuncios: true }
    });

    // Se o usuário não existir, retorna um erro 404
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    return res.json(user);

  } catch (error) {
    console.error('Erro ao buscar informações do usuário:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.post('/register', async (req: any, res: any) => {
  try {
    const { nome, email, senha } = req.body;


    if (!nome || !email || !senha) {
      return res.status(400).json({ error: "Todos os campos são obrigatórios" });
    }

    const user = await prisma.user.create({
      data: {
        nome,
        email,
        senha
      }
    });

    const users: User[] = await prisma.user.findMany()
    console.table(users)
    return res.status(201).json(user);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
});

//ANÚNCIO
//Carrega anúncios que um usuário cadastrou
app.get('/user/:uid/announce', async (req: any, res: any) => {
  const uid: number = parseInt(req.params.uid);

  if (isNaN(uid)){
    return res.status(400).json({error: 'ID do usuário incorreto'});
  }
  const anuncios: Anuncio[] = await prisma.anuncio.findMany({where:{
    vendedorId: uid,
    estaAberto: true
  }});

  console.table(anuncios);
  console.log('Chamada feita')
  return res.status(200).json(anuncios);
});

//Cria Anúncio
app.post('/:uid/announce', async (req: any, res: any) => {
  const uid: number = parseInt(req.params.uid);

  if (isNaN(uid)) {
    return res.status(400).json({ error: 'ID do usuário incorreto' });
  }

  const lookUser: User | null = await prisma.user.findUnique({
    where: {
      id: uid
    }
  });

  if (!lookUser) {
    return res.status(404).json({ error: 'Usuário não encontrado' });
  }

  try {
    const { titulo, descricao, estaAberto, trocaTemporaria, periodoDias, localizacao, estadoProduto, categoria } = req.body;

    if (!titulo || !descricao) {
      return res.status(400).json({ error: 'Título e descrição são obrigatórios' });
    }

    const newAnnounce = await prisma.anuncio.create({
      data: {
        titulo,
        descricao,
        estaAberto: estaAberto !== undefined ? estaAberto : true, 
        trocaTemporaria: trocaTemporaria !== undefined ? trocaTemporaria : false, 
        periodoDias: trocaTemporaria ? periodoDias : null, 
        vendedorId: uid,
        localizacao,
        estadoProduto,
        categoria
      }
    });

    res.status(201).json(newAnnounce);
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

//Lista todos os anúncios
app.get('/announce', async (req: any, res: any) => {
  try {
    const anuncios: Anuncio[] = await prisma.anuncio.findMany(
      {
        where: 
        
        {estaAberto: 
          {equals: true}
        }
      }
    );
    console.table(anuncios);
    return res.status(200).json(anuncios);

  }
  catch (error) {
    return res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

app.get("/announce/:uid", async (req: any, res: any) => {
  const uid: number = parseInt(req.params.uid);

  if (isNaN(uid)) {
    return res.status(400).json({ error: 'Anúncio inexistente' });
  }

  const lookAnuncio: Anuncio | null = await prisma.anuncio.findUnique({
    where: {
      id: uid
    }
  });

  if (!lookAnuncio) {
    return res.status(404).json({ error: 'Anuncio não encontrado' });
  }
    return res.status(200).json(lookAnuncio);
  
});

//OFERTAS
//Cria uma oferta para um anúncio
app.post("/announce/:aid/offer", async (req:any, res:any) => {
  const aid = parseInt(req.params.aid);

  if (isNaN(aid)) {
    return res.status(400).json({ error: 'ID do anúncio incorreto' });
  }

  const lookAnnounce = await prisma.anuncio.findUnique({
    where: { id: aid }
  });

  if (!lookAnnounce) {
    return res.status(404).json({ error: 'Anúncio não encontrado' });
  }

  try {
    const { oferta, vendedorId, compradorId } = req.body;

    if (!oferta || !vendedorId || !compradorId) {
      return res.status(400).json({ error: 'Oferta, vendedor e comprador são obrigatórios' });
    }

    const newOffer = await prisma.oferta.create({
      data: {
        oferta,
        compradorId,
        vendedorId,
        anuncioId: aid,
        
      }
    });
    console.log(newOffer)

    res.status(201).json(newOffer);
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

//Aceita a oferta
app.post("/accept/:oid", async (req: any, res: any) => {
  const oid: number = parseInt(req.params.oid);
  
  if (isNaN(oid)) {
    return res.status(400).json({ error: 'ID da oferta incorreto' });
  }

  try {
    
    const offer = await prisma.oferta.update({
      where: {
        id: oid
      },
      data: {
        aceito: true
      }
    });

    const announce = await prisma.anuncio.update({
      where: {
        id: offer.anuncioId
      },
      data: {
        estaAberto: false
      }
    });
    if(!announce){
      return res.status(401).json({message: `Anúncio não está mais disponível`})
    }

    return res.status(200).send();
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Pega todas as ofertas de um anúncio.
app.get("/:aid/offers", async (req: any, res: any) => {
  
  const aid: number = parseInt(req.params.aid);
   
  if (isNaN(aid)) {
    return res.status(400).json({ error: 'ID do anúncio incorreto' });
  }

  const lookAnnounce: Anuncio | null = await prisma.anuncio.findUnique({
    where: {
      id: aid
    }
  });

  if (!lookAnnounce) {
    return res.status(404).json({ error: 'Anúncio não encontrado' });
  }

  try {
    const offers = await prisma.oferta.findMany({
      where: {
        anuncioId: aid
      }
    });

    return res.status(200).json(offers);
  }
  catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});


//LISTA DE DESEJOS
//Retorna todos os anúncios na lista de desejos de um usuário 
app.get("/user/:uid/wishlist", async (req: any, res: any) => {

  const uid: number = parseInt(req.params.uid);

  if (isNaN(uid)) {
    return res.status(400).json({ error: 'ID do usuário incorreto' });
  }

  const lookUser: User | null = await prisma.user.findUnique({
    where: {
      id: uid
    }
  });

  if (!lookUser) {
    return res.status(404).json({ error: 'Usuário não encontrado' });
  }

  try {
    const offers = await prisma.oferta.findMany({
      where: {
        compradorId: uid
      },
      include: {
        anuncio: true
      } as never
    });

    return res.status(200).json(offers);
  }
  catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

//  Adiciona um anúncio na lista
app.post("/user/:uid/announce/:aid/wishlist",async(req: any, res:any)=>{
  const uid:number = parseInt(req.params.uid);
  const aid:number = parseInt(req.params.aid);

  if(isNaN(uid) || isNaN(aid)){
    return res.status(400).json({ error: 'ID do usuário/anúncio inválidos' });
  }

  const lookUser: User | null = await prisma.user.findUnique({
    where: {
      id: uid
    }
  });

  if (!lookUser) {
    return res.status(404).json({ error: 'Usuário não encontrado' });
  }

  const lookAnnounce: Anuncio | null = await prisma.anuncio.findUnique({
    where: {
      id: aid
    }
  });
  if (!lookAnnounce) {
    return res.status(404).json({ error: 'Usuário não encontrado' });
  }
  
  const lookWish = await prisma.listaDeDesejos.upsert({
    where: {
      userId: uid
    },
    update: {
      Anuncio: {
        connect: {
          id: aid
        }
      }
    },
    create: {
      userId: uid,
      Anuncio: {
        connect: {
          id: aid
        }
      }
    }
  });

  res.status(200).json(lookWish);

});

// Remover um anúncio da lista de desejos
app.delete("/user/:uid/announce/:aid/wishlist", async (req: any, res: any) => {
  const uid: number = parseInt(req.params.uid);
  const aid: number = parseInt(req.params.aid);

  if (isNaN(uid) || isNaN(aid)) {
    return res.status(400).json({ error: 'ID do usuário/anúncio inválidos' });
  }

  const lookAnnounce = await prisma.anuncio.findUnique({
    where: {
      id: aid
    }
  });

  if (!lookAnnounce) {
    return res.status(404).json({ error: 'Anúncio não encontrado' });
  }

  const userWishlist = await prisma.listaDeDesejos.findUnique({
    where: {
      userId: uid
    }
  });

  if (!userWishlist) {
    return res.status(404).json({ error: 'Lista de desejos não encontrada' });
  }

  await prisma.listaDeDesejos.update({
    where: {
      id: userWishlist.id
    },
    data: {
      Anuncio: {
        disconnect: {
          id: aid
        }
      }
    }
  });

  res.status(200).json();
});

//CARRINHO
//Adiciona a partir da Lista de Desejos os anúncios no carrinho
app.post("/user/:uid/wishlist-to-cart", async (req: any, res: any) => {
  const uid: number = parseInt(req.params.uid);

  if (isNaN(uid)) {
    return res.status(400).json({ error: 'ID do usuário inválido' });
  }

  // Buscar Lista de Desejos do usuário
  const wishlist = await prisma.listaDeDesejos.findUnique({
    where: {
      userId: uid
    },
    include: {
      Anuncio: {
        where:{
          estaAberto: true
        }
      } 
    }
  });

  if (!wishlist) {
    return res.status(404).json({ error: 'Lista de desejos não encontrada' });
  }

  let cart:Carrinho|null = await prisma.carrinho.findFirst({
    where: {
      userId: uid
    }
  });
  
  if (!cart) {
    cart = await prisma.carrinho.create({
      data: {
        userId: uid
      }
    });
  }
  
  await prisma.carrinho.update({
    where: {
      id: cart.id
    },
    data: {
      anuncios: {
        connect: wishlist.Anuncio.map(a => ({ id: a.id }))
      }
    }
  });
  

  res.status(200).json();
});

//Exclui vários itens do carrinho
app.delete("/user/:uid/cart", async (req: any, res: any) => {
  const uid: number = parseInt(req.params.uid);
  const anuncioIds: number[] = req.body.anuncioIds; // Array de IDs de anúncios a serem removidos

  if (isNaN(uid) || !Array.isArray(anuncioIds)) {
    return res.status(400).json({ error: 'Dados inválidos' });
  }

  const cart: Carrinho|null = await prisma.carrinho.findFirst({
    where: {
      userId: uid
    }
  });

  if (!cart) {
    return res.status(404).json({ error: 'Carrinho não encontrado' });
  }

  await prisma.carrinho.update({
    where: {
      id: cart.id
    },
    data: {
      anuncios: {
        disconnect: anuncioIds.map(id => ({ id }))
      }
    }
  });

  res.status(200).json({ message: 'Itens removidos do carrinho' });
});

//Cria uma oferta a partir do carrinho para vários anúncios
app.post("/user/:uid/offer-from-cart", async (req: any, res: any) => {
  const uid: number = parseInt(req.params.uid);
  
  if (isNaN(uid)) {
    return res.status(400).json({ error: 'ID do usuário inválido' });
  }

  const cart = await prisma.carrinho.findFirst({
    where: {
      userId: uid
    },
    include: {
      anuncios: {
        include: {
          vendedor:true
        }
      }
    }
  });

  if (!cart || cart.anuncios.length === 0) {
    return res.status(404).json({ error: 'Carrinho vazio ou não encontrado' });
  }

  const { oferta } = req.body;
  let offers:Oferta[] = new Array(cart.anuncios.length);

  for (let i = 0; i < cart.anuncios.length;i++) {
    const newOffer = await prisma.oferta.create({
      data: {
        oferta,
        compradorId: uid,
        vendedorId: cart.anuncios[i].vendedorId,
        anuncioId: cart.anuncios[i].id,
      }
    });
    offers[i] = newOffer;
  }

  res.status(200).json({ message: 'Ofertas criadas com sucesso', offers });
});


const PORT = 8080;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});



main().then(async () => {
  await prisma.$disconnect()
})
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })