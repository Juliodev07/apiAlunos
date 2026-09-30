const prisma = require("../databases/prisma");
const AlunoInvalidoError = require("../errors/AlunoInvalidoError");
const AlunoNaoEncontradoError = require("../errors/AlunoNaoEncontradoError");


const CAMPOS_ORDENAVEIS = ["id", "nome", "email", "createdAt", "updatedAt"];
const DIRECOES = ["asc", "desc"];
class AlunoService{

    async findMany(page, pageSize, orderBy, order){
        if(!CAMPOS_ORDENAVEIS.includes(orderBy)){
            throw new AlunoInvalidoError(
                `Campo de ordenação inválido. Use um destes: ${CAMPOS_ORDENAVEIS.join(", ")}.`
            );
        }
        if(!DIRECOES.includes(order)){
            throw new AlunoInvalidoError(
                'Direção de ordenação inválida. Use "asc" ou "desc".'
            );
        }

        // SELECT * FROM alunos ORDER BY <orderBy> <order> LIMIT ... OFFSET ...
        // count() conta todos os alunos do banco, não só os da página atual.
        const [alunos, total] = await Promise.all([
            prisma.aluno.findMany({
                skip: (page-1)*pageSize,
                take: Number(pageSize),
                orderBy: { [orderBy]: order }
            }),
            prisma.aluno.count()
        ]);

        return { alunos, total };
    
    }
    async findUnique(id){
        
        const idNumerico = Number(id);
        if(!Number.isInteger(idNumerico)){
            throw new AlunoInvalidoError("Id inválido.");
        }

       
        const aluno = await prisma.aluno.findUnique({
            where: { id: idNumerico }
        });

        if(!aluno){
            throw new AlunoNaoEncontradoError();
        }

        return aluno;
    }

    async create(aluno){
        const {nome, email} = aluno;
        if(!nome || !email){
            throw new AlunoInvalidoError();
        }
        //create = insert
        //update = update
        //delete = delete
        //findMany = select * from
        const novoAluno = await prisma.aluno.create({data:aluno});

        return novoAluno;
    }
}

module.exports = new AlunoService();