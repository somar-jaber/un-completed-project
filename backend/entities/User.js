const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
    name: "User",
    tableName: "users",
    columns: {
        id: {
            primary: true,
            type: "int",
            generated: true
        },
        username: {
            type: "varchar",
            length: 100,
        },
        email: {
            type: "varchar",
            length: 100,
            unique: true
        },
        password: {
            type: "varchar",
            length: 255
        },
        role: {
            type: "enum",
            enum: ["admin", "author"],
            default: "author"
        },
        createdAt: {
            type: "timestamp",
            createDate: true
        },
        updatedAt: {
            type: "timestamp",
            updateDate: true
        }
    }
});
