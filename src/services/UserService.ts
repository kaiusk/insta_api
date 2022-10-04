import { MariaDB } from "./MariaDB";
import { Password } from "./Password";
import { MIUser } from "../model/mi-user";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { validationResult } from "express-validator";
import jwt from "jsonwebtoken";

export default class UserService {
  /**
   * kasutajate list
   * @param req
   * @param res
   */
  static async getUsers(req: Request, res: Response) {
    const take: number = req.query.take ? +req.query.take : 10;
    const page: number = req.query.page ? +req.query.page : 1;
    const offset = page * take;
    MariaDB.query(
      `select *
             from MI_User
             limit ${offset}, ${take}`
    ).then((result) => {
      res.status(StatusCodes.OK).json(result);
    });
  }

  /**
   * kasutaja sisse logimine
   * @param req
   * @param res
   */
  static async login(req: Request, res: Response) {
    const { username, password } = req.body;
    if (username && password) {
      MariaDB.query("select * from MI_User where Username=?", [username]).then(
        (u) => {
          if (!u.length) {
            res
              .status(StatusCodes.FORBIDDEN)
              .json({ message: "invalid credentials" });
          } else {
            Password.compare(u[0].Password, password).then((correct) => {
              if (correct) {
                delete u[0].Password;
                const token = jwt.sign(
                  {
                    exp: Math.floor(Date.now() / 1000) + 60 * 60,
                    data: u[0],
                  },
                  process.env.JWT_SECRET || "secret"
                );
                res
                  .status(StatusCodes.OK)
                  .json({ message: "success", token: token });
              } else
                res
                  .status(StatusCodes.FORBIDDEN)
                  .json({ message: "invalid credentials" });
            });
          }
        }
      );
    } else {
      res
        .status(StatusCodes.FORBIDDEN)
        .json({ message: "invalid credentials" });
    }
  }

  /**
   * ühe kasutaja profiil
   * @param req
   * @param res
   */
  static async getUser(req: Request, res: Response) {
    if (+req.params.id) {
      return MariaDB.query(
        "select MU.Username,\n" +
          "       MU.Name,\n" +
          "       MU.ProfileImageUrl,\n" +
          "       MU.Bio,\n" +
          "       count(MP.ID)             as posts,\n" +
          "       count(MF.FollowerUserID) as fallowers,\n" +
          "       count(M.FollowerUserID)  as fallowees\n" +
          "from MI_User MU\n" +
          "         left join MI_Post MP on MU.ID = MP.UserID\n" +
          "         left join MI_Following MF on MU.ID = MF.FolloweeUserID\n" +
          "         left join MI_Following M on MU.ID = M.FollowerUserID\n" +
          "where MU.ID = ?\n" +
          "group by MU.ID",
        [+req.params.id]
      )
        .then((row) => {
          res.status(StatusCodes.OK).json(row[0]);
        })
        .catch((e) => {
          console.log(e);
          res.status(StatusCodes.NOT_FOUND).json({ message: "user not found" });
        });
    } else
      res.status(StatusCodes.NOT_FOUND).json({ message: "user not found" });
  }

  /**
   * kasutaja kustutamine
   * @param req
   * @param res
   */
  static async deleteUser(req: Request, res: Response) {
    return MariaDB.query("delete from MI_User where ID=?", [+req.params.id])
      .then((result) => {
        res.status(StatusCodes.OK).json({
          success: true,
          data: result,
        });
      })
      .catch((errors) => {
        res.status(StatusCodes.BAD_REQUEST).json({ errors: errors.array() });
      });
  }

  static async addUser(req: Request, res: Response) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ errors: errors.array() });
    }
    const user: MIUser = Object.assign(req.body);
    return Password.toHash(req.body.password as string).then(
      (hashedPassword) => {
        user.password = hashedPassword;
        MariaDB.query(
          "insert into MI_User (Bio, GenderID, Username, Name, Email, Password) values (?,?,?,?,?,?)",
          [
            user.bio,
            user.genderId,
            user.username,
            user.name,
            user.email as string,
            user.password as string,
          ]
        )
          .then((result) => {
            res.status(StatusCodes.CREATED).json({ data: result });
          })
          .catch((errors) => {
            res
              .status(StatusCodes.BAD_REQUEST)
              .json({ errors: errors.array() });
          });
      }
    );
  }

  static async updateUser(req: Request, res: Response) {
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
      },
      req.body
    );
    return MariaDB.query(
      "update MI_User set Bio=?, GenderID=?, Name=?, Email=?, ProfileImageUrl=?, Website=? where ID=?",
      [
        setUser.bio as string,
        setUser.genderId as number,
        setUser.name as string,
        setUser.email as string,
        setUser.profileImageUrl as string,
        setUser.website as string,
        +req.params.id,
      ]
    )
      .then((result) => {
        res.status(StatusCodes.OK).json({ success: true, data: result });
      })
      .catch((reason) => {
        res.status(StatusCodes.BAD_REQUEST).json({ errors: errors.array() });
      });
  }

  static async follow(req: Request, res: Response) {
    const followerId = req.auth?.data.ID; // get followerID from jwt token
    const followeeId = req.params.id;
    if (followerId && followeeId) {
      return MariaDB.query(
        "insert into MI_Following (FollowerUserID, FolloweeUserID) VALUES (?,?)",
        [followerId, followeeId]
      )
        .then((result) => {
          res.status(StatusCodes.OK).json({
            success: true,
            data: result,
          });
        })
        .catch((errors) => {
          res.status(StatusCodes.BAD_REQUEST).json({ errors: errors.array() });
        });
    } else {
      res.status(StatusCodes.BAD_REQUEST).json({ errors: "missing arguments" });
    }
  }

  static async unFollow(req: Request, res: Response) {
    const followerId = req.auth?.data.ID; // get followerID from jwt token
    const followeeId = req.params.id;
    if (followerId && followeeId) {
      return MariaDB.query(
        "delete from MI_Following where FollowerUserID=? and FolloweeUserID=?",
        [followerId, followeeId]
      )
        .then((result) => {
          res.status(StatusCodes.OK).json({
            success: true,
            data: result,
          });
        })
        .catch((errors) => {
          res.status(StatusCodes.BAD_REQUEST).json({ errors: errors.array() });
        });
    } else {
      res.status(StatusCodes.BAD_REQUEST).json({ errors: "missing arguments" });
    }
  }

  static async getPosts(req: Request, res: Response) {}

  /**
   * set all users same password (testing only!!!)
   * @param req
   * @param res
   */
  static async setPasswords(req: Request, res: Response) {
    return MariaDB.query("select ID from MI_User").then((data) => {
      data.forEach((id: any) => {
        Password.toHash("test").then((hashedPassword) => {
          return MariaDB.query("update MI_User set Password=? where ID=?", [
            hashedPassword,
            id.ID,
          ]).then((_) => {
            console.log(id.ID, "updated");
          });
        });
      });
    });
  }
}
