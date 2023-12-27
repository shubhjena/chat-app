import {Server} from 'socket.io'
import { Redis } from 'ioredis';

const pub = new Redis({
    host:'redis-20ad081e-shubh-5050.a.aivencloud.com',
    port: 27670,
    username: 'default',
    password: 'AVNS_BMH2Z6DDXdikpYkPJcl'
});
const sub = new Redis({
    host:'redis-20ad081e-shubh-5050.a.aivencloud.com',
    port: 27670,
    username: 'default',
    password: 'AVNS_BMH2Z6DDXdikpYkPJcl'
});

class SocketService{
    private _io: Server;

    constructor(){
        console.log("Initialize socket service...")
        this._io = new Server({
            cors: {
                allowedHeaders: ["*"],
                origin: '*',
            },
        });
        sub.subscribe("MESSAGES");
    }
    
    public initListeners(){
        const io = this.io;
        console.log("init socket listeners...");
        io.on('connect', socket =>{
            console.log(`New Socket Connected: ${socket.id}`);
            
            socket.on('event:message', async ({message}: {message:string}) => {
                console.log('New message Received', message);
                await pub.publish('MESSAGES',JSON.stringify({message}));
            })
        });
        sub.on('message',(channel,message)=>{
            if(channel === "MESSAGES"){
                io.emit("message", message);
            }
        })
        
    }

    get io(){
        return this._io;
    }
}

export default SocketService;