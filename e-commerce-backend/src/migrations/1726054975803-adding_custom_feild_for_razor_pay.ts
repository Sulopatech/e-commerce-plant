import {MigrationInterface, QueryRunner} from "typeorm";

export class AddingCustomFeildForRazorPay1726054975803 implements MigrationInterface {

   public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("ALTER TABLE `order` ADD `customFieldsRazorpay_order_id` varchar(255) NULL", undefined);
   }

   public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("ALTER TABLE `order` DROP COLUMN `customFieldsRazorpay_order_id`", undefined);
   }

}
