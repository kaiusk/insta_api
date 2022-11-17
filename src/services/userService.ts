import MariaDB from "./mariaDBService";
import PasswordService from "./passwordService";
import { MIUser } from "../model/mi-user";
import { Response } from "express";
import { Request } from "express-jwt";
import { StatusCodes } from "http-status-codes";
import { validationResult } from "express-validator";
import jwt from "jsonwebtoken";

const UserService = {
  /**
   * kasutaja sisse logimine
   * @param req
   * @param res
   */
  async login(req: Request, res: Response) {
    const { username, password } = req.body;
    if (username && password) {
      try {
        const user = await MariaDB.query(
          `select MU.id,
                            MU.username,
                            MU.name,
                            MU.profileImageUrl,
                            MU.bio,
                            MU.password,
                            MU.role,
                            (select count(*) from MI_Post MP where MP.userId = MU.id)              as posts,
                            (select count(*) from MI_Liking ML where ML.userId = MU.id)            as likes,
                            (select count(*) from MI_Following MF where MF.followerUserId = MU.id) as following,
                            (select count(*) from MI_Following MF where MF.followeeUserId = MU.id) as followers,
                            (select count(*) from MI_Comment MC where MC.userId = MU.id)           as comments,
                            0                                                                      as follow
                     from MI_User MU
                     where MU.username = ?
                     group by MU.id`,
          [username]
        );
        const valid = await PasswordService.compare(user[0].password, password);
        if (valid) {
          delete user[0].password;
          const token = jwt.sign(
            {
              exp: Math.floor(Date.now() / 1000) + 60 * 60,
              data: user[0],
            },
            process.env.JWT_SECRET ?? "secret"
          );
          res.status(StatusCodes.OK).json({ message: "success", token });
        } else {
          res
            .status(StatusCodes.FORBIDDEN)
            .json({ message: "invalid credentials" });
        }
      } catch (e) {
        res
          .status(StatusCodes.FORBIDDEN)
          .json({ message: "invalid credentials" });
      }
    } else {
      res
        .status(StatusCodes.FORBIDDEN)
        .json({ message: "invalid credentials" });
    }
  },

  /**
   * ühe kasutaja profiil
   * @param req
   * @param res
   */
  getUser(req: Request, res: Response) {
    if (+req.params.id) {
      MariaDB.query(
        `select MU.id,
                        MU.username,
                        MU.name,
                        MU.profileImageUrl,
                        MU.bio,
                        (select count(*) from MI_Post MP where MP.userId = MU.id)              as posts,
                        (select count(*) from MI_Liking ML where ML.userId = MU.id)            as likes,
                        (select count(*) from MI_Following MF where MF.followerUserId = MU.id) as following,
                        (select count(*) from MI_Following MF where MF.followeeUserId = MU.id) as followers,
                        (select count(*) from MI_Comment MC where MC.userId = MU.id)           as comments,
                        (select count(*)
                         from MI_Following MF
                         where MF.followeeUserId = MU.id
                           and MF.followerUserId = ?)                                          as follow
                 from MI_User MU
                 where MU.id = ?
                 group by MU.id`,
        [+req.params.id, +req.params.id]
      )
        .then((row: any[]) => {
          if (!row.length) {
            res
              .status(StatusCodes.NOT_FOUND)
              .json({ message: "user not found" });
          } else {
            res.status(StatusCodes.OK).json(row[0]);
          }
        })
        .catch((e: any) => {
          res.status(StatusCodes.NOT_FOUND).json({ message: "user not found" });
        });
    } else {
      res.status(StatusCodes.NOT_FOUND).json({ message: "user not found" });
    }
  },

  /**
   * kasutaja kustutamine
   * @param req
   * @param res
   */
  deleteUser(req: Request, res: Response) {
    MariaDB.query(
      `delete
             from MI_User
             where id = ?`,
      [+req.params.id]
    )
      .then((result: any) => {
        res.status(StatusCodes.OK).json({
          success: true,
          data: result,
        });
      })
      .catch((errors: { array: () => any }) => {
        res.status(StatusCodes.BAD_REQUEST).json({ errors: errors.array() });
      });
  },

  addUser(req: Request, res: Response) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ errors: errors.array() });
    }
    const user: MIUser = Object.assign(req.body);
    PasswordService.toHash(req.body.password as string)
      .then((hashedPassword) => {
        user.password = hashedPassword;
        MariaDB.query(
          `insert into MI_User (bio, genderId, username, name, email, password, role)
                     values (?, ?, ?, ?, ?, ?, ?)`,
          [
            user.bio,
            user.genderId,
            user.username,
            user.name,
            user.email as string,
            user.password,
            0,
          ]
        )
          .then((result: any) => {
            res.status(StatusCodes.CREATED).json({ data: result });
          })
          .catch((errors: { array: () => any }) => {
            res
              .status(StatusCodes.BAD_REQUEST)
              .json({ errors: errors.array() });
          });
      })
      .catch((errors) => {
        res.status(StatusCodes.BAD_REQUEST).json({ errors: errors.array() });
      });
  },

  updateUser(req: Request, res: Response) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ errors: errors.array() });
    }
    const setUser: MIUser = Object.assign(
      {
        username: "",
        name: "",
        website: "",
        genderId: 1,
        bio: "",
        email: "",
        profileImageUrl: "",
        role: 0,
      },
      req.body
    );
    MariaDB.query(
      `update MI_User
             set bio=?,
                 genderId=?,
                 name=?,
                 email=?,
                 profileImageUrl=?,
                 website=?,
                 role=?
             where id = ?`,
      [
        setUser.bio,
        setUser.genderId,
        setUser.name,
        setUser.email as string,
        setUser.profileImageUrl as string,
        setUser.website as string,
        setUser.role,
        +req.params.id,
      ]
    )
      .then((result: any) => {
        MariaDB.query(
          `select MU.id,
                            MU.username,
                            MU.name,
                            MU.profileImageUrl,
                            MU.bio,
                            (select count(id) from MI_Post MP where MP.userId = MU.id)   as posts,
                            (select count(*)
                             from MI_Following MF
                             where MF.followerUserId = MU.id)                            as following,
                            (select count(*)
                             from MI_Following MF
                             where MF.followeeUserId = MU.id)                            as followers,
                            (select count(*) from MI_Comment MC where MC.userId = MU.id) as comments,
                            (select count(*)
                             from MI_Following MF
                             where MF.followeeUserId = MU.id
                               and MF.followerUserId = ?)                                as follow
                     from MI_User MU
                     where MU.id = ?`,
          [+req.auth?.data.id, +req.params.id]
        ).then((data: any) => {
          res.status(StatusCodes.OK).json(data[0]);
        });
        //res.status(StatusCodes.OK).json({ success: true, data: result });
      })
      .catch(() => {
        res.status(StatusCodes.BAD_REQUEST).json({ errors: errors.array() });
      });
  },

  follow(req: Request, res: Response) {
    const followerId = req.auth?.data.id; // get followerid from jwt token
    const followeeId = req.params.id;
    if (followerId && followeeId) {
      MariaDB.query(
        `insert into MI_Following (followerUserId, followeeUserId)
                 VALUES (?, ?)`,
        [+followerId, +followeeId]
      )
        .then((result: any) => {
          res.status(StatusCodes.OK).json({
            success: true,
            data: result,
          });
        })
        .catch((errors: { array: () => any }) => {
          res.status(StatusCodes.BAD_REQUEST).json({ errors });
        });
    } else {
      res.status(StatusCodes.BAD_REQUEST).json({ errors: "missing arguments" });
    }
  },

  unFollow(req: Request, res: Response) {
    const followerId = req.auth?.data.id; // get followerid from jwt token
    const followeeId = req.params.id;
    if (followerId && followeeId) {
      MariaDB.query(
        `delete
                 from MI_Following
                 where followerUserId = ?
                   and followeeUserId = ?`,
        [+followerId, +followeeId]
      )
        .then((result: any) => {
          res.status(StatusCodes.OK).json({
            success: true,
            data: result,
          });
        })
        .catch((errors: { array: () => any }) => {
          res.status(StatusCodes.BAD_REQUEST).json({ errors });
        });
    } else {
      res.status(StatusCodes.BAD_REQUEST).json({ errors: "missing arguments" });
    }
  },

  userProfile(req: Request, res: Response) {
    MariaDB.query(
      `select MU.id,
                    MU.username,
                    MU.name,
                    MU.profileImageUrl,
                    MU.bio,
                    (select count(id) from MI_Post MP where MP.userId = MU.id)   as posts,
                    (select count(*)
                     from MI_Following MF
                     where MF.followerUserId = MU.id)                            as following,
                    (select count(*)
                     from MI_Following MF
                     where MF.followeeUserId = MU.id)                            as followers,
                    (select count(*) from MI_Comment MC where MC.userId = MU.id) as comments,
                    (select count(*)
                     from MI_Following MF
                     where MF.followeeUserId = MU.id
                       and MF.followerUserId = ?)                                as follow
             from MI_User MU
             where MU.id = ?`,
      [+req.auth?.data.id, +req.params.id]
    )
      .then((data: any) => {
        res.status(StatusCodes.OK).json(data[0]);
      })
      .catch((errors: any) => {
        res.status(StatusCodes.BAD_REQUEST).json({ errors });
      });
  },
};

export default UserService;
