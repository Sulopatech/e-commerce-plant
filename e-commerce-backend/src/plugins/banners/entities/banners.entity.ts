import {
    DeepPartial,
    Asset,
    VendureEntity
} from '@vendure/core';
import { Column, Entity, ManyToOne } from 'typeorm';


@Entity()
export class Banners extends VendureEntity {
    constructor(input?: DeepPartial<Banners>) {
        super(input);
    }

    @Column()
    name: string;

    @Column({ default: true })
    isActive: boolean;

    @Column({ nullable: true })
    description: string;

    @Column({ nullable: true })
    link: string;

    @ManyToOne(() => Asset, { eager: true })
    asset: Asset;
}
