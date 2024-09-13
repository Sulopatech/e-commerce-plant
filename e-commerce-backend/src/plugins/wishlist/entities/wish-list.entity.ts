import {
    Customer,
    DeepPartial,
    HasCustomFields,
    Product,
    VendureEntity
} from '@vendure/core';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';


export class WishListCustomFields {}

@Entity()
export class WishList extends VendureEntity implements HasCustomFields {
    constructor(input?: DeepPartial<WishList>) {
        super(input);
    }

    @ManyToOne(type => Customer)
    customer: Customer;

    @OneToMany(type => WishListItem, item => item.wishList)
    items: WishListItem[];

    @Column(type => WishListCustomFields)
    customFields: WishListCustomFields;
}

@Entity()
export class WishListItem extends VendureEntity {
    constructor(input?: DeepPartial<WishListItem>) {
        super(input);
    }

    @ManyToOne(type => WishList, {nullable: true})
    wishList: WishList;

    @ManyToOne(type => Product,{nullable: true})
    product: Product;
}



