const handleUserMessage = require('./handleUserMessage')
const handleGroupMessage = require('./handleGroupMessage')

//TODO: Improve logging!
//TODO: Improve Azure pipeline; make sure we actually run some tests!
module.exports = async function(context, mySbMsg) {
    context.log('JavaScript ServiceBus topic trigger function processed message: ', mySbMsg)
    context.log('=============================')
    context.log(typeof mySbMsg)
    context.log('=============================')
    //context.log(context.bindingData.userProperties.uGVersion)
    if(!mySbMsg){
        context.log('Message is empty or undefined, deleting from queue...')
        return
    }

    if(mySbMsg.ugClass === 'user'){
        await handleUserMessage(mySbMsg, context)
    }else if(mySbMsg.ugClass === 'group'){
        await handleGroupMessage(mySbMsg, context)
    }else{
        context.log(`Unexpected ugClass received: ${mySbMsg.ugClass}`)
    }

};
