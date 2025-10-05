export const livenessStep = async (req, res) => {
  try {
    const { step } = req.body;
    if (!step) return res.status(400).json({ success: false, message: "Step required" });

    // Here we just simulate validation
    console.log(`✅ Liveness step passed: ${step}`);

    res.json({ success: true, step, message: `${step} verified` });
  } catch (err) {
    res.status(500).json({ success: false, message: "Liveness step failed" });
  }
};

export const completeVerification = async (req, res) => {
  try {
    const userId = req.user.id;

    // Update in DB (for now just log)
    console.log(`🎉 Verification completed for user ${userId}`);

    res.json({ success: true, message: "Verification complete" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error completing verification" });
  }
};

export const getStatus = async (req, res) => {
  try {
    // You can fetch from DB, for now static
    res.json({
      success: true,
      status: "approved",
      txHash: "0x1234567890abcdef...",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching status" });
  }
};
