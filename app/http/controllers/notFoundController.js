function notFoundController() {
    return {
        index(req, res) {
            res.render('404')
        }
    }
}

module.exports = notFoundController;