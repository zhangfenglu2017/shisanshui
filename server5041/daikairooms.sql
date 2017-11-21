/*
Navicat MySQL Data Transfer

Source Server         : shisanshui
Source Server Version : 50553
Source Host           : localhost:3306
Source Database       : ssz

Target Server Type    : MYSQL
Target Server Version : 50553
File Encoding         : 65001

Date: 2017-11-21 18:29:16
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for `daikairooms`
-- ----------------------------
DROP TABLE IF EXISTS `daikairooms`;
CREATE TABLE `daikairooms` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `roomId` varchar(45) COLLATE utf8_bin NOT NULL DEFAULT '0',
  `createUserId` int(11) DEFAULT '0',
  `users` varchar(255) COLLATE utf8_bin DEFAULT '',
  `status` tinyint(4) DEFAULT '0',
  `createAt` datetime DEFAULT NULL,
  `updateAt` datetime DEFAULT NULL,
  `type` varchar(45) COLLATE utf8_bin DEFAULT '',
  PRIMARY KEY (`id`),
  UNIQUE KEY `roomId_UNIQUE` (`roomId`) USING BTREE
) ENGINE=MyISAM AUTO_INCREMENT=187251 DEFAULT CHARSET=utf8 COLLATE=utf8_bin;