import User from '../models/user.model'
import jwt from 'jsonwebtoken'
import expressJwt from 'express-jwt'
import config from '../config'

const signin = (req: any, res: any) => {
    User.findOne({
        "email": req.body.email
    }, (err, user: any) => {
        console.log(user)
        if (err || !user)
            return res.status('401').json({
                error: "User not found"
            })

        if (!user.authenticate(req.body.password)) {
            return res.status('401').send({
                error: "Email and password don't match."
            })
        }

        const token = jwt.sign({
            _id: user._id
        }, config.jwtSecret)

        res.cookie("t", token, {
            expire: new Date(new Date().getTime() + 9999)
        })

        return res.json({
            token,
            user: { _id: user._id, name: user.name, email: user.email }
        })
    })
}

const signout = (req: any, res: any) => {
    res.clearCookie("t")
    return res.status('200').json({
        message: "signed out"
    })
}

const requireSignin = expressJwt({
    secret: config.jwtSecret,
    userProperty: 'auth'
})

const hasAuthorization = (req: any, res: any, next: any) => {
    const authorized = req.profile && req.auth && req.profile._id == req.auth._id
    if (!authorized) {
        return res.status('403').json({
            error: "User is not authorized"
        })
    }
    next()
}

export default { signin, signout, requireSignin, hasAuthorization }