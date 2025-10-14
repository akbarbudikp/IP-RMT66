function errorHandler(err, req, res, next) {
    if (err.name === 'Unauthorized') {
        res.status(401).json({ message: err.message })
        return
    }

    if (err.name === "SequelizeValidationError" || 'SequelizeUniqueConstraintError') {
        res.status(400).json({ message: err.errors[0].message })
        return
        }

    if (err.name === 'JsonWebTokenError') {
        res.status(401).json({ message: 'Invalid token' })
        return
    }

    if (err.name === 'Forbidden') {
        res.status(403).json({ message: err.message })
        return
    }

    if (err.name === 'NotFound') {
        res.status(404).json({ message: err.message })
        return
    }

    if (err.name === 'BadRequest') {
        res.status(400).json({ message: err.message })
        return
    }

    res.status(500).json({ message: 'Internal server error'})
}

module.exports = errorHandler