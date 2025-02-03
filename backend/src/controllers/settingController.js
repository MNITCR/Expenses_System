const Setting = require('../models/settingModel')

const getSetting = async (req, res) => {
  const { userId } = req.query;
  try {
    const userQuery = userId ? { userId: userId } : {};
    const settings = await Setting.find(userQuery);

    res.status(200).json(settings);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const createSetting = async (req, res) => {
  const { userId, language, currency, theme, date_format } = req.body;
  try {
    if (!userId ) {
      return res.status(400).json({ message: "user id are required." });
    }

    const existingSetting = await Setting.findOne({ userId });

    if (existingSetting) {
      return res.status(400).json({ message: "setting already setup"});
    }

    const newSetting = new Setting({
      userId,
      language: language || 1,
      currency: currency || 1,
      theme: theme || 1,
      date_format: date_format || 1
    });

    const savedSetting = await newSetting.save();
    res.status(201).json(savedSetting);
  } catch (error) {
    res.status(500).json({ message: error.message});
  }
};

const updateSetting = async (req, res) => {
  const { id } = req.params;
  const userId = {userId: id};
  try {
    const settings = await Setting.findOneAndUpdate(userId, req.body);

    if (!settings) {
      return res.status(404).json({ message: "Setting not found." });
    }

    res.status(200).json(settings);
  } catch (error) {
      res.status(404).json({ message: error.message });
  }
};

module.exports = {
    getSetting,
    createSetting,
    updateSetting
}
