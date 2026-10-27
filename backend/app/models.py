"""
SQLAlchemy Database Models for KISAN CULTURE.
Persists conversation history, farmer reports, and tool execution logs.
"""

from datetime import datetime
import json
from sqlalchemy import Column, String, Integer, DateTime, Text, Float, Boolean
from app.database import Base


class ConversationSessionModel(Base):
    """Stores farmer chat sessions with the Universal AI Agent."""
    __tablename__ = "conversation_sessions"

    id = Column(String, primary_key=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    crop_context = Column(String, nullable=True, default="Wheat")
    state = Column(String, nullable=True, default="Haryana")
    district = Column(String, nullable=True, default="Karnal")
    language = Column(String, default="en")
    messages_json = Column(Text, default="[]")  # JSON array of {role, content, timestamp}

    def get_messages(self):
        try:
            return json.loads(self.messages_json or "[]")
        except Exception:
            return []

    def set_messages(self, messages_list):
        self.messages_json = json.dumps(messages_list)


class FarmerReportModel(Base):
    """Stores generated agronomic advisory reports."""
    __tablename__ = "farmer_reports"

    report_id = Column(String, primary_key=True, index=True)
    title = Column(String, nullable=False)
    generated_at = Column(DateTime, default=datetime.utcnow)
    state = Column(String, nullable=False)
    district = Column(String, nullable=False)
    village = Column(String, nullable=True)
    crop_name = Column(String, nullable=False)
    tools_used_json = Column(String, default="[]")
    executive_summary = Column(Text, nullable=False)
    action_priorities_json = Column(Text, default="[]")
    disclaimers_json = Column(Text, default="[]")
    pdf_path = Column(String, nullable=True)

    def to_dict(self):
        return {
            "reportId": self.report_id,
            "title": self.title,
            "generatedAt": self.generated_at.strftime("%d %B %Y, %I:%M %p") if self.generated_at else "",
            "farmerLocation": {
                "state": self.state,
                "district": self.district,
                "village": self.village or "",
            },
            "cropName": self.crop_name,
            "toolsUsed": json.loads(self.tools_used_json or "[]"),
            "executiveSummary": self.executive_summary,
            "actionPriorities": json.loads(self.action_priorities_json or "[]"),
            "disclaimers": json.loads(self.disclaimers_json or "[]"),
            "pdfPath": self.pdf_path,
        }


class ToolExecutionLogModel(Base):
    """Audit log for tool runs to prevent phantom / fake execution claims."""
    __tablename__ = "tool_execution_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    session_id = Column(String, index=True, nullable=True)
    tool_name = Column(String, index=True, nullable=False)
    executed_at = Column(DateTime, default=datetime.utcnow)
    status = Column(String, default="success")  # success | error | skipped
    duration_ms = Column(Integer, default=0)
    input_summary = Column(Text, nullable=True)
    error_message = Column(Text, nullable=True)

