CREATE TABLE IF NOT EXISTS `bans` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `username` text DEFAULT NULL,
  `steam_id` varchar(20) NOT NULL,
  `reason` text DEFAULT NULL,
  `moderator` text NOT NULL,
  `banned_from` text NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `bans_UN` (`steam_id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4;