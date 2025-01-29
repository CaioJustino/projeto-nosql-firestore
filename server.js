/*
    Configurações Iniciais
*/
const express = require('express');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');

/*
    Inicializa o Firebase Admin SDK
*/
const serviceAccount = require('./firebase-config.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const app = express();
const PORT = 3000;

app.use(bodyParser.json());

/*
    CREATE - Adicionar um novo documento
*/
app.post('/:collectionName', async (req, res) => {
  try {
    const { collectionName } = req.params; // Nome da coleção na URL
    const data = req.body; // Dados do corpo da requisição

    if (!data || Object.keys(data).length === 0) {
      return res.status(400).send('Request body must contain fields for the document.');
    }

    const collection = db.collection(collectionName); // Referência à coleção dinâmica
    const result = await collection.add(data); // Adiciona o documento
    res.status(201).send({ id: result.id });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

/*
    READ - Obter todos os documentos de uma coleção
*/
app.get('/:collectionName', async (req, res) => {
  try {
    const { collectionName } = req.params; // Nome da coleção na URL
    const collection = db.collection(collectionName); // Referência à coleção dinâmica

    const snapshot = await collection.get();
    if (snapshot.empty) {
      return res.status(404).send('No documents found.');
    }

    const documents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).send(documents);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

/*
    READ - Obter um documento específico
*/
app.get('/:collectionName/:id', async (req, res) => {
  try {
    const { collectionName, id } = req.params; // Nome da coleção e ID do documento
    const doc = await db.collection(collectionName).doc(id).get();

    if (!doc.exists) {
      return res.status(404).send('Document not found.');
    }

    res.status(200).send({ id: doc.id, ...doc.data() });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

/*
    UPDATE - Atualizar um documento
*/
app.put('/:collectionName/:id', async (req, res) => {
  try {
    const { collectionName, id } = req.params;
    const data = req.body;

    if (!data || Object.keys(data).length === 0) {
      return res.status(400).send('Request body must contain fields to update.');
    }

    const docRef = db.collection(collectionName).doc(id);
    await docRef.update(data);
    res.status(200).send('Document updated successfully.');
  } catch (error) {
    res.status(500).send(error.message);
  }
});

/*
    DELETE - Excluir um documento
*/
app.delete('/:collectionName/:id', async (req, res) => {
  try {
    const { collectionName, id } = req.params;
    await db.collection(collectionName).doc(id).delete();
    res.status(200).send('Document deleted successfully.');
  } catch (error) {
    res.status(500).send(error.message);
  }
});

/*
    Iniciar o servidor
*/
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:3000`);
});