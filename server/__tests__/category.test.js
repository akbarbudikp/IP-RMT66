const { Category, Product, sequelize } = require('../models');
const modelDefinition = require('../models/category');
const categoryData = {
    name: 'Elektronik & Gadget',
    description: 'Semua jenis perangkat elektronik dan gadget terbaru.'
};
const productData = {
    name: 'Smartphone Pro Max',
    description: 'Smartphone canggih dengan kamera terbaik.',
    price: 15000000,
    stock: 100,
    imageUrl: 'http://example.com/image.png'
};


describe('Category Model', () => {

    beforeAll(async () => {
        await sequelize.sync({ force: true }); 
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    afterAll(async () => {
        await sequelize.close();
    });

    describe('Validations and Hooks', () => {
        it('should create a category successfully and generate a slug automatically', async () => {
            const category = await Category.create(categoryData);

            expect(category.id).toBeDefined();
            expect(category.name).toBe(categoryData.name);
            expect(category.slug).toBe('elektronik--gadget'); 
        });

        it('should fail to create a category without a name', async () => {
            try {
                await Category.create({ description: 'Kategori tanpa nama' });
            } catch (error) {
                expect(error.name).toBe('SequelizeValidationError');
                expect(error.errors[0].message).toBe('Category name required');
            }
        });
    });

    describe('Associations', () => {
        it('should fetch a category along with its associated products', async () => {
            const category = await Category.create({ name: 'Pakaian Pria' });

            await Product.create({ ...productData, categoryId: category.id });
            await Product.create({ ...productData, name: 'Kemeja Formal', categoryId: category.id });

            const categoryWithProducts = await Category.findOne({
                where: { id: category.id },
                include: {
                    model: Product,
                    as: 'products' 
                }
            });

            expect(categoryWithProducts).toBeDefined();
            expect(categoryWithProducts.products).toBeDefined();
            expect(categoryWithProducts.products.length).toBe(2); 
            expect(categoryWithProducts.products[0].name).toBe('Smartphone Pro Max');
        });
    });
});