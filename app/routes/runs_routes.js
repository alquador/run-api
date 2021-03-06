// Express docs: http://expressjs.com/en/api.html
const express = require('express')
// Passport docs: http://www.passportjs.org/docs/
const passport = require('passport')

// pull in Mongoose model for examples
const Run = require('../models/run')

// this is a collection of methods that help us detect situations when we need
// to throw a custom error
const customErrors = require('../../lib/custom_errors')

// we'll use this function to send 404 when non-existant document is requested
const handle404 = customErrors.handle404
// we'll use this function to send 401 when a user tries to modify a resource
// that's owned by someone else
const requireOwnership = customErrors.requireOwnership

// this is middleware that will remove blank fields from `req.body`, e.g.
// { example: { title: '', text: 'foo' } } -> { example: { text: 'foo' } }
const removeBlanks = require('../../lib/remove_blank_fields')
// passing this as a second argument to `router.<verb>` will make it
// so that a token MUST be passed for that route to be available
// it will also set `req.user`
const requireToken = passport.authenticate('bearer', { session: false })

// instantiate a router (mini app that only handles routes)
const router = express.Router()

// INDEX
// GET /examples
router.get('/runs', (req, res, next) => {
	Run.find({}) 
		.then((runs) => {
			// `examples` will be an array of Mongoose documents
			// we want to convert each one to a POJO, so we use `.map` to
			// apply `.toObject` to each one
			return runs.map((run) => run.toObject())
			//return runs
		})
		// respond with status 200 and JSON of the examples
		.then((runs) => res.status(200).json({ runs: runs }))
		// if an error occurs, pass it to the handler
		.catch(next)
})

// SHOW
// GET /runs/6253400fb9e5fc13530aa3a2
router.get('/runs/:id', (req, res, next) => {
	// req.params.id will be set based on the `:id` in the route
	Run.findById(req.params.id)
		.then(handle404)
		// if `findById` is succesful, respond with 200 and "example" JSON
		.then((run) => res.status(200).json({ run: run.toObject() }))
		// if an error occurs, pass it to the handler
		.catch(next)
})

// CREATE
// POST /examples
router.post('/runs', requireToken, (req, res, next) => {
    // we brought in requireToken, so we can have access to req.user
    req.body.run.owner = req.user.id

    Run.create(req.body.run)
        .then(run => {
            // send a successful response like this
            res.status(201).json({ run: run.toObject() })
        })
        // if an error occurs, pass it to the error handler
        .catch(next)
})

// UPDATE
// PATCH /examples/5a7db6c74d55bc51bdf39793
router.patch('/runs/:id', requireToken, removeBlanks, (req, res, next)=>{
    //if the client attempts to change the owner of the run we can disallow that from the get go
    delete req.body.owner
    //then find adventure by id
    Run.findById(req.params.id)
    //handle 404
    .then(handle404)
    //require ownership and update adventure
    .then(run =>{
        //requireOwnership(req, run)
        return run.updateOne(req.body.run)
    })
    //send a 204 no content if successful 
    .then(()=>res.sendStatus(204))
    //pass to errorhandler if not successful
    .catch(next)
})

// DESTROY
// DELETE /examples/5a7db6c74d55bc51bdf39793
router.delete('/runs/:id', (req, res, next) => {
	Run.findById(req.params.id)
		.then(handle404)
		.then((run) => {
			// throw an error if current user doesn't own `example`
			// requireOwnership(req, example)
			// delete the example ONLY IF the above didn't throw
			run.deleteOne()
		})
		// send back 204 and no content if the deletion succeeded
		.then(() => res.sendStatus(204))
		// if an error occurs, pass it to the handler
		.catch(next)
})

module.exports = router
