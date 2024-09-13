import {MigrationInterface, QueryRunner} from "typeorm";

export class AddingWishlist1726232915249 implements MigrationInterface {

   public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("CREATE TABLE `wish_list` (`createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), `id` int NOT NULL AUTO_INCREMENT, `customerId` int NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB", undefined);
        await queryRunner.query("CREATE TABLE `wish_list_item` (`createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), `id` int NOT NULL AUTO_INCREMENT, `wishListId` int NULL, `productId` int NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB", undefined);
        await queryRunner.query("ALTER TABLE `wish_list` ADD CONSTRAINT `FK_74782762c693210754f7740e794` FOREIGN KEY (`customerId`) REFERENCES `customer`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION", undefined);
        await queryRunner.query("ALTER TABLE `wish_list_item` ADD CONSTRAINT `FK_8f6ca74588d7965c2a1b0736e45` FOREIGN KEY (`wishListId`) REFERENCES `wish_list`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION", undefined);
        await queryRunner.query("ALTER TABLE `wish_list_item` ADD CONSTRAINT `FK_d19d5852883529084b9f9619c4d` FOREIGN KEY (`productId`) REFERENCES `product`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION", undefined);
   }

   public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("ALTER TABLE `wish_list_item` DROP FOREIGN KEY `FK_d19d5852883529084b9f9619c4d`", undefined);
        await queryRunner.query("ALTER TABLE `wish_list_item` DROP FOREIGN KEY `FK_8f6ca74588d7965c2a1b0736e45`", undefined);
        await queryRunner.query("ALTER TABLE `wish_list` DROP FOREIGN KEY `FK_74782762c693210754f7740e794`", undefined);
        await queryRunner.query("DROP TABLE `wish_list_item`", undefined);
        await queryRunner.query("DROP TABLE `wish_list`", undefined);
   }

}
