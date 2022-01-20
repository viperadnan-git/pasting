const keyLength = process.env.KEY_LENGTH || 8;


const pages = {
    Page404: {
        heading: "404",
        content: `<a class="text-decoration-none text-dark" href="/"><div class="container"><h1>404 - Page not found</h1><p><i>Unable to find your pasted code maybe it doesn't exists.</i></p><span class="text-muted small">Tap to go home</span></div></a>`,
    },
    Page500: {
        heading: "500",
        content: `<a class="text-decoration-none text-dark" href="/"><div class="container"><h1>500 - Unknown Error</h1><p><i>An unknown error has occurred. Contact the developer with the url to fix it. Inconvenience is strictly regretted.</i></p><span class="text-muted small">Tap to go home</span></div></a>`,
    }
}


const generateKey = async () => {
    var randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var result = '';
    for (var i = 0; i < keyLength; i++) {
        result += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
    }
    return result;
}


const generateDomainName = (hostname, port) => {
    if (process.env.DOMAIN_NAME) {
        return process.env.DOMAIN_NAME
    } else if (process.env.DETA_RUNTIME) {
        return process.env.DETA_PATH + '.deta.dev'
    } else {
        return hostname + ":" + port
    }
}


module.exports = {
    pages,
    generateKey,
    generateDomainName
}