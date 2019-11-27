import User from '../models/user.model'
import _ from 'lodash'
import errorHandler from './../helpers/dbErrorHandler'
import formidable from 'formidable'
import fs from 'fs'
var profileImage = require('../assets/images/profile-pic.png')

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
    let form = new formidable.IncomingForm()
    form.keepExtensions = true
    form.parse(req, (err, fields, files) => {
        if (err) {
            return res.status(400).json({
                error: "Photo could not be uploaded"
            })
        }
        let user = req.profile
        user = _.extend(user, fields)
        user.updated = Date.now()
        if (files.photo) {
            user.photo.data = fs.readFileSync(files.photo.path)
            user.photo.contentType = files.photo.type
        }
        user.save((err: any, result: any) => {
            if (err) {
                return res.status(400).json({
                    error: errorHandler.getErrorMessage(err)
                })
            }
            user.hashed_password = undefined
            user.salt = undefined
            res.json(user)
        })
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
    User.findById(id)
        .populate('following', '_id name')
        .populate('followers', '_id name')
        .exec((err, user) => {
            if (err || !user)
                return res.status('400').json({
                    error: "User not found"
                })
            req.profile = user
            next()
        })
}

const photo = (req: any, res: any, next: any) => {
    if (req.profile.photo.data) {
        res.set("Content-Type", req.profile.photo.contentType)
        return res.send(req.profile.photo.data)
    }
    next()
}

const defaultPhoto = (req: any, res: any) => {
    return res.sendFile(process.cwd() + profileImage)
}

const addFollowing = (req: any, res: any, next: any) => {
    User.findByIdAndUpdate(req.body.userId, { $push: { following: req.body.followId } }, (err, result) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler.getErrorMessage(err)
            })
        }
        next()
    })
}

const addFollower = (req: any, res: any, next: any) => {
    User.findByIdAndUpdate(req.body.followId,
        { $push: { following: req.body.userId } },
        { new: true })
        .populate('following', '_id name')
        .populate('followers', '_id name')
        .exec((err, result: any) => {
            if (err) {
                return res.status(400).json({
                    error: errorHandler.getErrorMessage(err)
                })
            }
            result.hashed_password = undefined
            result.salt = undefined
            res.json(result)
        })
}

const removeFollowing = (req: any, res: any, next: any) => {
    User.findByIdAndUpdate(req.body.userId,
        { $pull: { following: req.body.unfollowId } },
        (err, result) => {
            if (err) {
                return res.status(400).json({
                    error: errorHandler.getErrorMessage(err)
                })
            }
            next()
        })
}

const removeFollower = (req: any, res: any) => {
    User.findByIdAndUpdate(req.body.followId,
        { $pull: { following: req.body.userId } },
        { new: true })
        .populate('following', '_id name')
        .populate('followers', '_id name')
        .exec((err, result: any) => {
            if (err) {
                return res.status(400).json({
                    error: errorHandler.getErrorMessage(err)
                })
            }
            result.hashed_password = undefined
            result.salt = undefined
            res.json(result)
        })
}

export default {
    create,
    userByID,
    read,
    list,
    remove,
    update,
    photo,
    defaultPhoto,
    addFollower,
    addFollowing,
    removeFollower,
    removeFollowing
}