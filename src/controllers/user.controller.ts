import User from '../models/user.model'
import _ from 'lodash'
import errorHandler from './../helpers/dbErrorHandler'

const create = (req: any, res: any, next: any) => {
    const user = new User(req.body)
    user.save((err, result) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler.getErrorMessage(err)
            })
        }
        res.status(200).json({
            message: "Successfully signed up!"
        })
    })
}

const list = (req: any, res: any) => {
    User.find((err, users) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler.getErrorMessage(err)
            })
        }
        res.json(users)
    }).select('name email updated created')
}


const read = (req: any, res: any) => {
    req.profile.hashed_password = undefined
    req.profile.salt = undefined
    return res.json(req.profile)
}

const update = (req: any, res: any, next: any) => {
    let user = req.profile
    user = _.extend(user, req.body)
    user.updated = Date.now()
    user.save((err: any) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler.getErrorMessage(err)
            })
        }
        user.hashed_password = undefined
        user.salt = undefined
        res.json(user)
    })
}

const remove = (req: any, res: any, next: any) => {
    let user = req.profile
    user.remove((err: any, deletedUser: any) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler.getErrorMessage(err)
            })
        }
        deletedUser.hashed_password = undefined
        deletedUser.salt = undefined
        res.json(deletedUser)
    })
}


/**
 * Load user and append to req.
 */
const userByID = (req: any, res: any, next: any, id: any) => {
    User.findById(id).exec((err, user) => {
        if (err || !user)
            return res.status('400').json({
                error: "User not found"
            })
        req.profile = user
        next()
    })
}


export default {
    create,
    userByID,
    read,
    list,
    remove,
    update
}