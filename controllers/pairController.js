exports.generatePairCode = async (req, res) => {
  const { number } = req.body;

  if (!number) {
    return res.status(400).json({
      success: false,
      message: "Number is required"
    });
  }

  // 🔥 fake pairing code (for learning)
  const code = Math.floor(100000 + Math.random() * 900000);

  res.json({
    success: true,
    number: number,
    pairing_code: code
  });
};