import { VercelRequest, VercelResponse } from "@vercel/node";
import { ReqBody, ResBody } from "alice-types";
import end from "./end-response";
import getApi from "./get-api";
import formatTaskContent from "../../utils/format-task-content";

const PAGE_SIZE = 5; // TODO: set to 10

export default async function handleUtterance(
  req: VercelRequest,
  res: VercelResponse,
  body: ReqBody
) {
  const intents = body.request.nlu?.intents;
  const isGetTasks = intents?.["get_tasks"];
  // TODO: uncomment
  let page = 2;
  // Number(req.cookies["page"]);
  console.log(req.cookies);

  if (Number.isNaN(page) || page < 1) {
    page = 1;
    res.setHeader(
      "Set-Cookie",
      "page=1; expires=Fri, 31 Dec 9999 21:10:10 GMT"
    );
  }

  if (isGetTasks) {
    const api = getApi(body);
    const tasks = await api.getTasks();

    const totalPages = Math.max(Math.ceil(tasks.length / PAGE_SIZE), 1);
    let skip = (page - 1) * PAGE_SIZE;
    let tasksInPage = tasks.slice(skip, PAGE_SIZE + skip);
    if (!tasksInPage.length) {
      page = 1;
      skip = (page - 1) * PAGE_SIZE;
      res.setHeader(
        "Set-Cookie",
        "page=1; expires=Fri, 31 Dec 9999 21:10:10 GMT"
      );
      tasksInPage = tasks.slice(skip, PAGE_SIZE + skip);
    }

    // TODO: add pauses (tts)
    const text = tasksInPage.length
      ? `${tasksInPage
          .map((task) => formatTaskContent(task.content))
          .join("\n\n")}\n\n\n${
          totalPages > 1
            ? `Страница ${page} из ${totalPages}. ${
                page < totalPages
                  ? 'Для перехода на следующую, скажите "дальше"\n'
                  : ""
              }${page > 1 ? 'Для перехода назад, скажите "назад"\n' : ""}`
            : ""
        }Скажите "закрой задачу" и название задачи, чтобы отметить её как выполненную`
      : `Все задачи выполнены. Так держать!\nСоздайте новую задачу, сказав "создай задачу"`;

    const answer: ResBody = {
      version: body.version,
      response: {
        text,
        end_session: false,
      },
    };
    end(res, answer);
    return;
  }

  const answer: ResBody = {
    version: body.version,
    response: {
      text: `Извините, не поняла Вас.\nСкажите "что ты умеешь" для просмотра возможных действий`,
      end_session: false,
    },
  };
  end(res, answer);
}
