import mongoose from "mongoose";

const mongoDbURI = `mongodb+srv://otavioviniciusads:whatsappclonepassword@main.uymqohn.mongodb.net/?retryWrites=true&w=majority&appName=main`

const connect = async() =>{
    try {
        await mongoose.connect(mongoDbURI, {dbName: 'db_whatsapp'})
        console.log("Conectado!")
    } catch (error) {
        console.log(`Erro ao conectar com o banco de dados: ${error}`)
    }
}

connect()