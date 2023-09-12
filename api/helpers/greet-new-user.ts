import { ReqBody, ResBody } from "alice-types";
import end from "./end-response";
import { VercelResponse } from "@vercel/node";

export default async function greetNewUser(res: VercelResponse, body: ReqBody) {
  const answer: ResBody = {
    version: body.version,
    response: {
      text: `Добро пожаловать!\nВ навыке Вы можете управлять своими задачами todoist.\nСкажите "задачи", чтобы узнать список открытых задач.`,
      end_session: false,
    },
  };

  end(res, answer);
}
