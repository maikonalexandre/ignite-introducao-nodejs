const express = require("express");
const { v4: uuidv4 } = require("uuid");
const app = express();
//const port = 3333;
app.listen(3333);
app.use(express.json());

function veryfiIfExistsCpf(req, res, next) {
  const { cpf } = req.headers;

  const customer = customers.find((customer) => customer.cpf === cpf);

  if (!customer) {
    return res.status(400).json({ error: "Customer not found" });
  }
  req.customer = customer;
  return next();
}

function getBalance(statement) {
  const balance = statement.reduce((acc, operation) => {
    if (operation.type === "credit") {
      return acc + operation;
    } else {
      return acc - operation;
    }
  }, 0);

  return balance;
}

const customers = [];

app.post("/account", (req, res) => {
  const { cpf, name } = req.body;

  const customerAllExist = customers.some((customer) => customer.cpf === cpf);

  if (!customerAllExist) {
    customers.push({
      cpf,
      name,
      id: uuidv4(),
      statement: [],
    });
    return res.status(201).json({ onSucess: "Sucess" });
  }
  return res.status(400).json({ error: "bad request" });
});

app.get("/statement", veryfiIfExistsCpf, (req, res) => {
  const { customer } = req;
  return res.json(customer.statement);
});

app.post("/deposit", veryfiIfExistsCpf, (req, res) => {
  const { amount, description } = req.body;
  const { customer } = req;

  const statementOparation = {
    description,
    amount,
    createdAt: new Date(),
    type: "credit",
  };

  customer.statement.push(statementOparation);

  return res.status(401).json({ onSucces: "Sucess" });
});

app.post("/withdraw", veryfiIfExistsCpf, (req, res) => {
  const { customer } = req;
  const { amount } = req.body;

  const balance = getBalance(customer.statement);

  if (balance < amount) {
    return res.status(400).json({ error: "not founds" });
  } else {
    const statementOparation = {
      amount,
      createdAtd: new Date(),
      type: "debit",
    };

    customer.statement.push(statementOparation);

    return res.status(201).send();
  }
});

app.get("/statement/date", veryfiIfExistsCpf, (req, res) => {
  const { customer } = req;
  const { date } = req.query;

  const dateFormat = new Date(date + " 00:00");

  const statement = customer.statement.filter(
    (statement) =>
      statement.createdAt.toDateString() === new Date(dateFormat).toDateString()
  );

  return res.json(statement);
});

app.put("/account", veryfiIfExistsCpf, (req, res) => {
  const { name } = req.body;
  const { customer } = req;

  customer.name = name;

  return res.status(201).send();
});

app.get("/account", veryfiIfExistsCpf, (req, res) => {
  const { customer } = req;
  return res.json(customer);
});

app.delete("/account", veryfiIfExistsCpf, (req, res) => {
  const { customer } = req;

  customers.splice(customer, 1);

  return res.status(200).json(customers);
});

app.get("/balance", veryfiIfExistsCpf, (req, res) => {
  const { customer } = req;

  const balance = getBalance(customer.statement);

  return res.status(200).json(balance);
});
