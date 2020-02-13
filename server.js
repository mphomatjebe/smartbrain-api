const express = require('express');
const bodyparser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex')

const db = knex({
  	client: 'pg',
  	connection: {
    host : '127.0.0.1',
    user : 'postgres',
    password : 'test',
    database : 'smartbrain'
  }
});

db.select('*').from('public.users').then(data =>{
	
});

const app = express();

app.use(bodyparser.json());
app.use(cors())

app.get('/', (req, res)=>{
	res.send(database.users);
})

app.post('/signin', (req, res)=>{
	const {email, password} = req.body;
	if(!email || !password){
		return res.status(400).json('incorrect form submission')

	}

db.select('email', 'hash').from('public.login')
	.where('email', '=', email)
	.then(data=>{
		const isValid = bcrypt.compareSync(password, data[0].hash);
		if(isValid){
			return db.select('*').from('public.users')
			.where('email', '=', req.body.email)
			.then(user=>{
				res.json(user[0])
			})
			.catch(err=> res.status(400).json('unable to get user'))
		}else{
			res.status(400).json('wrong credentials')
		}
		
	})
	.catch(err=> res.status(400).json('wrong credentials'))
})

app.post('/register', (req, res)=>{
	const {email, name, password} = req.body;
	if(!email || !name || !password){
		return res.status(400).json('incorrect form submission')

	}
	const hash = bcrypt.hashSync(password);
	db.transaction(trx =>{
		trx.insert({
			hash: hash,
			email: email
		})
		.into('public.login')
		.returning('email')
		.then(loginEmail=>{
			return trx('public.users')
			.returning('*')
			.insert({
				email: loginEmail[0],
				name: name,
				joined: new Date()
			})
			.then(user=>{
				res.json(user[0]);
			})
		})
		.then(trx.commit)
		.catch(trx.rollback)
	})
		
	.catch(err=>res.status(400).json('unable to register'))

	

})

app.get('/profile/:id', (req, res)=>{
	const {id} = req.params;
	db.select('*').from('public.users').where({
		id: id
	})
	.then(user=>{
		if(user.length){
			res.json(user[0])
		}else{
			 res.status(400).json('Not found')
		}
		
	})
	.catch(err=> res.status(400).json('Error getting user'))
	
})

app.put('/image', (req, res)=>{
	   const {id} = req.body;
	  db('public.users').where('id', '=', id)
	  .increment('entries', 1)
	  .returning('entries')
	  .then(entries=>{
	  	res.json(entries[0]);
	  })
	  .catch(err=> res.status(400).json('unable to get entries'))
})



// // Load hash from your password DB.



app.listen(3001, ()=>{
	console.log('App is running on port 3001');
});