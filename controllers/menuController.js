module.exports = {
    showMenu: (req, res) => {
        const menu = {
            categories: [
                {
                    name: 'Appetizers',
                    items: [
                        {
                            name: 'Samosa',
                            desc: 'Crispy pastry filled with spiced potatoes and peas',
                            price: 5.99
                        },
                        {
                            name: 'Pakoras',
                            desc: 'Assorted vegetable fritters with mint chutney',
                            price: 6.99
                        }
                    ]
                },
                {
                    name: 'Main Courses',
                    items: [
                        {
                            name: 'Butter Chicken',
                            desc: 'Tender chicken in rich tomato and butter sauce',
                            price: 14.99
                        },
                        {
                            name: 'Vegetable Biryani',
                            desc: 'Fragrant basmati rice with mixed vegetables and spices',
                            price: 12.99
                        }
                    ]
                },
                {
                    name: 'Desserts',
                    items: [
                        {
                            name: 'Gulab Jamun',
                            desc: 'Sweet milk dumplings in rose-flavored syrup',
                            price: 4.99
                        },
                        {
                            name: 'Kheer',
                            desc: 'Traditional rice pudding with cardamom and nuts',
                            price: 4.99
                        }
                    ]
                }
            ]
        };
        res.render('menu', { menu });
    }
};
