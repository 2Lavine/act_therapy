"use client";
import {
  Button,
  Card,
  Divider,
  InputNumber,
  List,
  Space,
  Typography,
} from "antd";
import { Fragment, useState } from "react";

const { Title, Text } = Typography;

type RatingPair = {
  importance: number;
  match: number;
};

type Ratings = {
  [key: string]: RatingPair;
};

type HistoryEntry = {
  ratings: Ratings;
  date: string;
  totalScore: number;
};

const OPTIONS = [
  "家庭（婚姻或育儿除外）",
  "亲密关系（婚姻/情侣）",
  "养育",
  "朋友/社交生活",
  "工作",
  "教育/培训",
  "消遣/娱乐",
  "精神生活",
  "公民权利/社区生活",
  "身体状况（饮食、运动、睡眠）",
  "环境问题",
  "艺术、创意表达、美学",
];

export default function RatingApp() {
  const [ratings, setRatings] = useState<Ratings>(
    OPTIONS.reduce((acc, option) => {
      acc[option] = { importance: 1, match: 1 };
      return acc;
    }, {} as Ratings)
  );
  const [date, setDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [totalScore, setTotalScore] = useState<number>(0);

  const handleRatingChange = (
    option: string,
    field: keyof RatingPair,
    value: number
  ) => {
    setRatings((prevRatings) => ({
      ...prevRatings,
      [option]: {
        ...prevRatings[option],
        [field]: value,
      },
    }));
  };

  const handleSubmit = () => {
    if (typeof window !== "undefined") {
      const total = Math.ceil(
        Object.values(ratings).reduce(
          (sum, { importance, match }) => sum + importance * match,
          0
        ) / 12
      );
      setTotalScore(total);

      const newEntry: HistoryEntry = { ratings, date, totalScore: total };
      const updatedHistory = [...history, newEntry];
      localStorage.setItem("history", JSON.stringify(updatedHistory));
      setHistory(updatedHistory);
      alert(`Your responses have been saved! Total Score: ${total}`);
    }
  };
  const deleteHistory = (index: number) => {
    const updatedHistory = history.filter((_, i) => i !== index);
    localStorage.setItem("history", JSON.stringify(updatedHistory));
    setHistory(updatedHistory);
  };
  const loadHistory = () => {
    if (typeof window !== "undefined") {
      const savedHistory = localStorage.getItem("history");
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }
      setShowHistory((prev) => !prev);
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: 20 }}>
      <Title level={2} style={{ textAlign: "center" }}>
        价值生活问卷调查
      </Title>
      <Text
        type="secondary"
        style={{ display: "block", textAlign: "center", marginBottom: 20 }}
      >
        Date: {date}
      </Text>

      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        {OPTIONS.map((option) => (
          <Card title={option} key={option}>
            <Space direction="horizontal" size="large">
              <div>
                <Text>Importance:</Text>
                <InputNumber
                  min={1}
                  max={10}
                  value={ratings[option].importance}
                  onChange={(value) =>
                    handleRatingChange(option, "importance", value || 0)
                  }
                />
              </div>
              <div>
                <Text>Match:</Text>
                <InputNumber
                  min={1}
                  max={10}
                  value={ratings[option].match}
                  onChange={(value) =>
                    handleRatingChange(option, "match", value || 0)
                  }
                />
              </div>
            </Space>
          </Card>
        ))}
      </Space>

      <Divider />

      <Button
        type="primary"
        block
        onClick={handleSubmit}
        style={{ marginBottom: 10 }}
      >
        Submit
      </Button>
      <Button block onClick={loadHistory}>
        {showHistory ? "Hide History" : "Show History"}
      </Button>

      {showHistory && (
        <List
          header={<Text strong>History</Text>}
          bordered
          dataSource={history}
          renderItem={(entry, index) => (
            <List.Item key={index}>
              <div>
                <Text>Date: {entry.date}</Text>
                <br />
                {/* <Text>Ratings: {JSON.stringify(entry.ratings)}</Text> */}
                <div>
                  {Object.keys(entry.ratings).map((item) => {
                    return (
                      <Fragment key={item}>
                        {item +
                          ":   " +
                          (entry.ratings[item].match -
                            entry.ratings[item].importance) +
                          "分"}
                        <br />
                      </Fragment>
                    );
                  })}
                </div>
                <br />
                <div className="flex justify-between items-center">
                  <Text strong>Total Score: {entry.totalScore}</Text>
                  <Button danger onClick={() => deleteHistory(index)}>
                    Del
                  </Button>
                </div>
              </div>
            </List.Item>
          )}
          style={{ marginTop: 20 }}
        />
      )}
    </div>
  );
}
