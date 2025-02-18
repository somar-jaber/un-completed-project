const argon2 = require('argon2');

async function initializeAdmin(AppDataSource) {
    try {
        const userRepository = AppDataSource.getRepository("User");
        
        // Check if admin already exists
        const existingAdmin = await userRepository.findOne({
            where: { email: "admin@gmail.com" }
        });

        if (!existingAdmin) {
            // Create new admin user
            const hashedPassword = await argon2.hash("Admin1234*");
            const admin = userRepository.create({
                username: "admin-admin",
                email: "admin@gmail.com",
                password: hashedPassword,
                role: "admin"
            });
            
            await userRepository.save(admin);
            console.log("Admin user created successfully!");
        } else {
            console.log("Admin user already exists, skipping initialization.");
        }
    } catch (error) {
        console.error("Error initializing admin user:", error);
        throw error;
    }
}

module.exports = initializeAdmin;
