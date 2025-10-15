function adminOnly(req, res, next) {

    if (req.user.role === 'admin') {
        return next()
    } else {
        return next({ name: 'Forbidden', message: "You're unauthorized"})
    }
}

module.exports = adminOnly