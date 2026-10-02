const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

/**
 * Schema do usuário.
 *
 * Por que não armazenamos a senha diretamente?
 * Porque se o banco vazar, o atacante teria as senhas de todos
 * os usuários em texto puro. Com bcrypt, ele obtém apenas hashes
 * computacionalmente caros de reverter.
 *
 * Por que email único?
 * Email é o identificador de login — não pode haver dois usuários
 * com o mesmo email ou um tentaria logar com a conta do outro.
 */
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Nome é obrigatório'],
      trim: true,
      minlength: [2, 'Nome deve ter pelo menos 2 caracteres'],
      maxlength: [100, 'Nome deve ter no máximo 100 caracteres'],
    },

    email: {
      type: String,
      required: [true, 'Email é obrigatório'],
      unique: true,
      lowercase: true, // normaliza para evitar duplicatas como "User@email.com" vs "user@email.com"
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Email inválido'],
    },

    password: {
      type: String,
      required: [true, 'Senha é obrigatória'],
      minlength: [6, 'Senha deve ter pelo menos 6 caracteres'],
      select: false, // nunca retorna a senha em queries por padrão
    },
  },
  {
    timestamps: true, // adiciona createdAt e updatedAt automaticamente
  }
);

/**
 * Middleware "pre-save" do Mongoose.
 *
 * É executado automaticamente antes de qualquer .save().
 * Aqui fazemos o hash da senha ANTES de salvar no banco.
 *
 * Por que verificar isModified('password')?
 * Para não re-hashear a senha quando o usuário atualizar
 * apenas o nome ou email. Hash de um hash quebraria o login.
 *
 * Por que não usar arrow function aqui?
 * Arrow functions não têm "this" próprio. Precisamos do "this"
 * para acessar o documento atual do Mongoose.
 */
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;

  const SALT_ROUNDS = 12;
  this.password = await bcrypt.hash(this.password, SALT_ROUNDS);
});

/**
 * Método de instância para comparar senha.
 *
 * Por que adicionar no schema e não no service?
 * Porque é uma responsabilidade intrínseca do usuário saber
 * verificar sua própria senha. O service só orquestra.
 *
 * Uso: const isMatch = await user.comparePassword(senhaDigitada);
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
