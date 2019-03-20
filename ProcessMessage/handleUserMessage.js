const Canvas = require('@kth/canvas-api')

const canvas = Canvas(process.env.CANVAS_URL, process.env.CANVAS_TOKEN)

async function userExists(message){
    try{
        await canvas.get(`/users/sis_user_id:${message.kthid}`)
        return true
    }catch(e){
        if (e.statusCode === 404) {
            return false
          } else {
            throw e
          }
    }
}

async function updateUser(message){
    const body = {
            user: {
                'name': `${message.given_name} ${message.family_name}`,
                'email': message.primary_email,
                'sortable_name': `${message.family_name}, ${message.given_name}`,
                'short_name': null // a fix to make sure that display name is updated
            }
        }
    await canvas.requestUrl(`/users/sis_user_id:${message.kthid}`, 'PUT', body)
}

async function createUser(message){
    const body = {
        pseudonym: {
          unique_id: `${message.username}@kth.se`, // CSVs analogi av 'login_id'
          sis_user_id: message.kthid // CSVs analogi av 'user_id' needed for enrollments
        },
        user: {
          'name': `${message.given_name} ${message.family_name}`,
          'sortable_name': `${message.family_name}, ${message.given_name}`
        },
        communication_channel: {
          type: 'email',
          address: message.primary_email,
          skip_confirmation: true
        }
      }
      await canvas.requestUrl(`/accounts/1/users`, 'POST', body)
}

module.exports = async function(message, context){
    context.log('Handling user message.')

    if(!message.affiliation || !message.affiliation.includes('member')){
       context.log('User of irrelevant affilition(s): ', message)
       return
    }

    if(!message.username || !message.kthid){
        context.log('User missing username or kthid: ', message)
        return
    }

    if(!message.given_name && !message.family_name){
        context.log('User missing given_name and family_name: ', message)
        return
    }

    if(await userExists(message)){
        await updateUser(message)
    }else{
        await createUser(message)
    }

}
