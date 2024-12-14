const express = require('express');
require("dotenv").config();
const { connecttoDb, getDb } = require('./src/database/db');
const cors = require('cors');
const UserRouter = require('./src/routes/users/usersRoutes');
const transactionRoutes = require('./src/routes/transactionRoute');
const userSingleton = require('./src/User_ID');
const bcrypt = require('bcrypt');

let db;
//init app
const app = express();
PORT = process.env.PORT;
//middlewares
app.use(express.json());
app.use(cors());

//routes
app.use('/api/users',UserRouter)
app.use("/api/transactions", transactionRoutes);



//dbConnection
connecttoDb((err) => {
  if (!err){
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
    db = getDb()
  }
});


//-------------------------------------------------------------------------      
//posting and getting for signup
app.post('/Signup', (req, res) => {
  const user = req.body;
  user._id=user.username;
  // Hash the password
  bcrypt.hash(user.password, 10, (err, hashedPassword) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Password hashing error.' });
    }

    // Check if the user with the given email already exists
    db.collection('users').findOne({ email: user.email })
      .then(existingUser => {
        if (existingUser) {
          res.status(400).json({ success: false, message: 'User with the provided email already exists.' });
        } else {
          // Replace the plaintext password with the hashed password
          user.password = hashedPassword;

          // Insert the user into the database
          db.collection('users').insertOne(user)
            .then(result => {
              console.log("User added successfully");
              res.status(201).json(result);
            })
            .catch(error => {
              res.status(500).json({ success: false, message: 'Server error.' });
            });
        }
      })
      .catch(error => {
        res.status(500).json({ success: false, message: 'Server error.' });
      });
  });
});



app.get('/Signup', async (req, res) => {
  try {
    if (!db) {
      console.log ("Database connection not established");
    }
    
    const users = await db.collection('users').find().sort({ username: 1 }).toArray();
    
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error.message);
    res.status(500).json({ error: 'Error fetching users from the database' });
}
});

//------------------------------------------------------------------------      
//posting and getting for login

app.post('/Login', async (req, res) => {
  const {username, password} = req.body;
  userSingleton.setUserId(username);
  //code
  try {
    
    const user = await db.collection('users').findOne({ username });
    
    if (!user) {
      return res.json({ success: false, message: 'Invalid username or password.' });
    }
    
    // Compare the provided password with the stored hashed password
    // Note: You should use a secure hashing library like bcrypt for this
    const pass = await bcrypt.compare(password, user.password);
    
    if (!pass) {
      return res.json({ success: false, message: 'Invalid username or password.' });
    }
    
    console.log("Login successful.") 
    return res.json({ success: true, message: 'Login successful.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
  }


)

//--------------------------------------------------------------------------
app.post('/transactions', (req, res) => {
  const {Type,amount,description} = req.body;
  user_id = userSingleton.getUserId();
  console.log({user_id,Type,amount,description});
  db.collection('transactions')
  .insertOne({user_id,Type,amount,description})
  .then(result => {
    console.log("transactions added successfully")
    res.status(201).json(result);
    })
  });

app.post('/expense', (req, res) => {
  const {Type,amount,description} = req.body;
  user_id = userSingleton.getUserId();
  console.log({user_id,Type,amount,description});
  db.collection('expense')
  .insertOne({user_id,Type,amount,description})
  .then(result => {
    console.log("expense added successfully")
    res.status(201).json(result);
    })
  });
app.post('/income', (req, res) => {
  const {Type,amount,description} = req.body;
  user_id = userSingleton.getUserId();
  console.log({user_id,Type,amount,description});
  db.collection('income')
  .insertOne({user_id,Type,amount,description})
  .then(result => {
    console.log("income added successfully")
    res.status(201).json(result);
    })
  });

  app.get("/api/transactions", async (req, res) => {
    try {
      const username = userSingleton.getUserId();
      const transactionsCursor = await db.collection("transactions").find({ user_id: username });
      const transactions = await transactionsCursor.toArray(); // Convert cursor to array
      res.status(200).json(transactions);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error fetching transactions from the database" });
    }
  });

  const xss = require('xss');

app.use(express.json());

app.post('/user-input', (req, res) => {
    // Example: Sanitize user input to prevent XSS
    const sanitizedInput = xss(req.body.userInput);

    // Now save sanitized input to database or use it for further processing
    console.log(sanitizedInput);
    res.json({ message: 'Input successfully sanitized' });
});


const escapeHtml = require('escape-html');

// Example of dynamically inserting user input safely into HTML response
app.get('/message', (req, res) => {
    const message = req.query.message || ''; // Get user message from query params
    const safeMessage = escapeHtml(message); // Escape HTML entities in user input

    res.send(`<h1>${safeMessage}</h1>`);
});