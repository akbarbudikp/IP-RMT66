function adminOnly(req, res, next) {
    console.log('2. req.body di dalam ADMINONLY:', req.body);
    if (req.user.role === 'admin') {
        return next()
    } else {
        return next({ name: 'Forbidden', message: "You're unauthorized"})
    }
}

module.exports = adminOnly