import express from 'express'
const XRoutes = express.Router();
import {tweets} from '../controllers/X.controller.js'

XRoutes.get('/tweets', tweets)

export default XRoutes