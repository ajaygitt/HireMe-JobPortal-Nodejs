const users = []

module.exports={
    userJoin:(id,sender,receiver)=>{
        const user = {id,sender,receiver}
        users.push(user)
        return user;
    },
    getCurrentUser:(id)=>
    {
        return users.find(user=> user.id===id)
    }
}