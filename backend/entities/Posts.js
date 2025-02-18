const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
    name: "Posts",
    tableName: "posts",
    columns: {
        id: {
            primary: true,
            type: "int",
            generated: true
        },
        title: {
            type: "varchar",
            length: 255,
            nullable: false
        },
        message: {
            type: "json",
            nullable: false,
            comment: "Contains text content and array of media paths. Format: { text: string, media: [{ type: 'image'|'video', path: string }] }"
        },
        createdAt: {
            type: "timestamp",
            createDate: true
        },
        updatedAt: {
            type: "timestamp",
            updateDate: true
        },
        authorId: {
            type: "int"
        }
    },
    relations: {
        author: {
            type: "many-to-one",
            target: "User",
            joinColumn: {
                name: "authorId"
            },
            onDelete: "CASCADE"
        }
    },
    indices: [
        {
            name: "IDX_POSTER_AUTHOR",
            columns: ["authorId"]
        }
    ]
});
