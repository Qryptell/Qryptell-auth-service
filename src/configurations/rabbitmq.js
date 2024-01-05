import amqp from 'amqplib/callback_api.js'

export const queue = 'lunarloom_auth_email'
export var emailChannel = null
export default function configureMq() {

    amqp.connect('amqp://localhost', function (error0, connection) {

        if (error0) {
            throw error0
        }
        connection.createChannel(function (error1, channel) {

            if (error1) {
                throw error1
            }

            channel.assertQueue(queue, {
                durable: false
            })

            emailChannel = channel

        })

    })
    return emailChannel
    
}