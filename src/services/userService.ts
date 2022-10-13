import MariaDB from "./mariaDBService";
import PasswordService from "./passwordService";
import { MIUser } from "../model/mi-user";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { validationResult } from "express-validator";
import jwt from "jsonwebtoken";

const UserService = {
  /**
   * kasutajate list
   * @param req
   * @param res
   */
  getUsers(req: Request, res: Response) {
    const take: number = req.query.take ? +req.query.take : 10;
    const page: number = req.query.page ? +req.query.page : 1;
    const offset = page * take;
    MariaDB.query(
      `select *
             from MI_User
             limit ${offset}, ${take}`
    )
      .then((result: any) => {
        res.status(StatusCodes.OK).json(result);
      })
      .catch(() => {
        res
          .status(StatusCodes.FORBIDDEN)
          .json({ message: "invalid credentials" });
      });
  },

  /**
   * kasutaja sisse logimine
   * @param req
   * @param res
   */
  login(req: Request, res: Response) {
    const { username, password } = req.body;
    if (username && password) {
      MariaDB.query("select * from MI_User where Username=?", [username])
        .then((u: string | any[]) => {
          if (!u.length) {
            res
              .status(StatusCodes.FORBIDDEN)
              .json({ message: "invalid credentials" });
          } else {
            PasswordService.compare(u[0].Password, password)
              .then((correct) => {
                if (correct) {
                  delete u[0].Password;
                  const token = jwt.sign(
                    {
                      exp: Math.floor(Date.now() / 1000) + 60 * 60,
                      data: u[0],
                    },
                    process.env.JWT_SECRET ?? "secret"
                  );
                  res
                    .status(StatusCodes.OK)
                    .json({ message: "success", token });
                } else {
                  res
                    .status(StatusCodes.FORBIDDEN)
                    .json({ message: "invalid credentials" });
                }
              })
              .catch(() => {});
          }
        })
        .catch(() => {
          res
            .status(StatusCodes.FORBIDDEN)
            .json({ message: "invalid credentials" });
        });
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
        .then((row: any[]) => {
          res.status(StatusCodes.OK).json(row[0]);
        })
        .catch((e: any) => {
          console.log(e);
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
    MariaDB.query("delete from MI_User where ID=?", [+req.params.id])
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
          "insert into MI_User (Bio, GenderID, Username, Name, Email, Password) values (?,?,?,?,?,?)",
          [
            user.bio,
            user.genderId,
            user.username,
            user.name,
            user.email as string,
            user.password,
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
      },
      req.body
    );
    MariaDB.query(
      "update MI_User set Bio=?, GenderID=?, Name=?, Email=?, ProfileImageUrl=?, Website=? where ID=?",
      [
        setUser.bio,
        setUser.genderId,
        setUser.name,
        setUser.email as string,
        setUser.profileImageUrl as string,
        setUser.website as string,
        +req.params.id,
      ]
    )
      .then((result: any) => {
        res.status(StatusCodes.OK).json({ success: true, data: result });
      })
      .catch(() => {
        res.status(StatusCodes.BAD_REQUEST).json({ errors: errors.array() });
      });
  },

  follow(req: Request, res: Response) {
    // @ts-expect-error
    const followerId = req.auth?.data.ID; // get followerID from jwt token
    const followeeId = req.params.id;
    if (followerId && followeeId) {
      MariaDB.query(
        "insert into MI_Following (FollowerUserID, FolloweeUserID) VALUES (?,?)",
        [followerId, followeeId]
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
    } else {
      res.status(StatusCodes.BAD_REQUEST).json({ errors: "missing arguments" });
    }
  },

  unFollow(req: Request, res: Response) {
    // @ts-expect-error
    const followerId = req.auth?.data.ID; // get followerID from jwt token
    const followeeId = req.params.id;
    if (followerId.length && followeeId.length) {
      MariaDB.query(
        "delete from MI_Following where FollowerUserID=? and FolloweeUserID=?",
        [followerId, followeeId]
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
    } else {
      res.status(StatusCodes.BAD_REQUEST).json({ errors: "missing arguments" });
    }
  },

  getProfile(req: Request, res: Response) {
    MariaDB.query(
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
      .then((data: any) => {
        res.status(StatusCodes.OK).json(data);
      })
      .catch(() => {
        res.status(StatusCodes.NOT_FOUND).json({ message: "user not found" });
      });
  },

  /**
   * set all users same password (testing only!!!)
   * @param req
   * @param res
   */
  setPasswords(req: Request, res: Response) {
    MariaDB.query("select ID from MI_User")
      .then((data: any[]) => {
        data.forEach((id: any) => {
          PasswordService.toHash("test")
            .then(async (hashedPassword) => {
              MariaDB.query("update MI_User set Password=? where ID=?", [
                hashedPassword,
                id.ID,
              ])
                .then((_: any) => {
                  console.log(id.ID, "updated");
                })
                .catch(() => {});
            })
            .catch(() => {});
        });
      })
      .catch(() => {});
  },
};

export default UserService;
