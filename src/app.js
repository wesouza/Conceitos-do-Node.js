const express = require("express");
const cors = require("cors");

//isUuid - Ultilizado para verificação de ID
const { uuid, isUuid } = require("uuidv4");

const app = express();

app.use(express.json());
app.use(cors());

const repositories = [];

// Middlewares

const repoExists = (req, res, next) => {
  const { id } = req.params;

  const repositoryIndex = repositories.findIndex((rep) => rep.id == id);

  if (repositoryIndex < 0)
    return res.status(400).json({ error: "Repository not exist" });

  req.repositoryIndex = repositoryIndex;

  return next();
};

const validId = (req, res, next) => {
  const { id } = req.params;

  if (!isUuid(id)) return res.status(400).json({ error: "ID Invalid" });

  req.repositoryId = id;

  return next();
};

/*
  GET /repositories
  Rota que lista todos os repositórios;
 */

app.get("/repositories", (req, res) => {
  return res.status(200).json(repositories);
});

/*
  POST /repositories
  A rota deve receber title, url e techs dentro do corpo da requisição,sendo a URL o link para o github desse repositório.
  Ao cadastrar um novo projeto, ele deve ser armazenado dentro de um objeto no seguinte formato: 
  { id: "uuid", title: 'Desafio Node.js', url: 'http://github.com/...', techs: ["Node.js", "..."], likes: 0 };
  Certifique-se que o ID seja um UUID, e de sempre iniciar os likes como 0.
*/

app.post("/repositories", (req, res) => {
  const { title, url, techs } = req.body;

  const repository = {
    id: uuid(),
    title,
    url,
    techs,
    likes: 0,
  };

  repositories.push(repository);

  return res.status(200).json(repository);
});

/*
  PUT /repositories/:id
  A rota deve alterar apenas o title, a url e as techs do repositório que possua o id igual
  ao id presente nos parâmetros da rota;
*/

app.put("/repositories/:id", validId, repoExists, (req, res) => {
  const { title, url, techs } = req.body;
  const { likes } = repositories[req.repositoryIndex];

  const repository = {
    id: req.repositoryId,
    title,
    url,
    techs,
    likes,
  };

  repositories[req.repositoryIndex] = repository;

  return res.status(201).json(repository);
});

/*
  DELETE /repositories/:id
  A rota deve deletar o repositório com o id presente nos parâmetros da rota;
*/

app.delete("/repositories/:id", validId, repoExists, (req, res) => {
    repositories.splice(req.repositoryIndex, 1);

    return res.status(204).send();
  }
);

/*
  POST /repositories/:id/like
  A rota deve aumentar o número de likes do repositório específico escolhido através do id presente
  nos parâmetros da rota, a cada chamada dessa rota, o número de likes deve ser aumentado em 1;
*/

app.post("/repositories/:id/like", validId, repoExists, (req, res) => {
    const { title, url, techs } = repositories[req.repositoryIndex];
    let { likes } = repositories[req.repositoryIndex];

    likes = likes + 1;

    const repository = {
      id: req.repositoryId,
      title,
      url,
      techs,
      likes,
    };

    repositories[req.repositoryIndex] = repository;

    return res.status(201).json({ likes });
  }
);

module.exports = app;