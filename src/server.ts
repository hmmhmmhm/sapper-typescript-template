import sirv from 'sirv'
import polka from 'polka'
import compression from 'compression'

// @ts-ignore
import * as sapper from '@sapper/server'

const { PORT, NODE_ENV } = process.env
const dev = NODE_ENV === 'development'

/**
 * @description
 * * Remember, HMR does not apply to this file.
 */
polka() // You can also use Express
    .use(
        compression({ threshold: 0 }),
        sirv('static', { dev }),
        sapper.middleware()
    )
    .listen(PORT, (err) => {
        if (err) console.log('error', err)
    })
