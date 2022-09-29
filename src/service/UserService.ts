import { MariaDB } from "./MariaDB";
import { Password } from "./Password";
import { MIUser } from "../model/mi-user";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { validationResult } from "express-validator";

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
          if (!u) {
            res
              .status(StatusCodes.FORBIDDEN)
              .json({ message: "invalid credentials" });
          } else {
            Password.compare(u[0].Password, password).then((correct) => {
              if (correct)
                res.status(StatusCodes.OK).json({ message: "success" });
              else
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
   * @param id
   */
  static async deleteUser(req: Request, res: Response) {
    /*UserService.deleteUser(+req.params.id).then((result) => {
            if (!result) {
                res.status(StatusCodes.NOT_FOUND).json({
                    success: false,
                    message: `User not found`,
                });
            } else {
                res.status(StatusCodes.OK).json({
                    success: true,
                    message: `User deleted`,
                });
            }
        });*/
    return MariaDB.query("delete from MI_User where ID=?", [+req.params.id]);
  }

  static async addUser(req: Request, res: Response) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ errors: errors.array() });
    }
    const user: MIUser = Object.assign(req.body);
    Password.toHash(req.body.password as string).then((hashedPassword) => {
      user.password = hashedPassword;
      return MariaDB.query(
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
          //return { success: true, data: result };
        })
        .catch((reason) => {
          //return { success: false, error: reason.text };
        });
    });
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
        return { success: true, data: result };
      })
      .catch((reason) => {
        return { success: false, error: reason.text };
      });
  }
}
