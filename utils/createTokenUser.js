
const createTokenUser = ({ user }) => {
    const { _id, name, role } = user;
    return { userId: _id, name, role }
}

module.exports = createTokenUser;