# 📋 Smart Webhook Router - Complete Documentation

## System Overview
I built an intelligent webhook routing system that automatically directs incoming webhook data to the correct Notion page based on a category header. The system uses conditional paths to route data to 6 different Notion categories.

## 🏗️ Architecture
```
Webhook Trigger → Smart Router (6 Paths) → Notion Pages

Webhook Input
     ↓
┌─────────────────┐
│   Path Router   │
├─────────────────┤
│ A: Mission      │ → 🎯 MISSION CONTROL
│ B: Design Brief │ → 🎨 DESIGN BRIEFS
│ C: Build Tasks  │ → 🔨 BUILD TASKS
│ D: Design Sys   │ → 📐 DESIGN SYSTEM
│ E: Content      │ → 📝 CONTENT LIBRARY
│ F: Bug Tracker  │ → 🐛 BUG TRACKER
└─────────────────┘
```

## 🔧 Routing Logic
Each path triggers when the webhook header contains specific keywords:

| Path | Trigger Keyword | Notion Destination |
|------|----------------|-------------------|
| A | mission | 🎯 MISSION CONTROL |
| B | design-brief | 🎨 DESIGN BRIEFS |
| C | build | 🔨 BUILD TASKS |
| D | design-system | 📐 DESIGN SYSTEM |
| E | content | 📝 CONTENT LIBRARY |
| F | bug | 🐛 BUG TRACKER |

## 🌐 Webhook URL
Your webhook URL: Available in Step 1 of your Zap (click the webhook trigger to copy it)

## 💻 Code Examples

### Basic Usage with cURL
```bash
# Mission Control
curl -X POST "YOUR_WEBHOOK_URL" \
  -H "category: mission" \
  -H "Content-Type: application/json" \
  -d '{"title": "New mission objective", "content": "Deploy new features by Friday"}'

# Design Brief
curl -X POST "YOUR_WEBHOOK_URL" \
  -H "category: design-brief" \
  -H "Content-Type: application/json" \
  -d '{"project": "Landing page redesign", "deadline": "2024-01-15"}'

# Build Tasks
curl -X POST "YOUR_WEBHOOK_URL" \
  -H "category: build" \
  -H "Content-Type: application/json" \
  -d '{"task": "Implement user authentication", "priority": "high"}'
```

### Python Implementation
```python
import requests
import json

class NotionWebhookRouter:
    def __init__(self, webhook_url):
        self.webhook_url = webhook_url

    def send_to_category(self, category, data):
        """Send data to specific Notion category"""
        headers = {
            'category': category,
            'Content-Type': 'application/json'
        }

        response = requests.post(
            self.webhook_url,
            headers=headers,
            data=json.dumps(data)
        )
        return response

    def mission_control(self, title, content):
        return self.send_to_category('mission', {
            'title': title,
            'content': content,
            'timestamp': datetime.now().isoformat()
        })

    def design_brief(self, project_name, requirements):
        return self.send_to_category('design-brief', {
            'project': project_name,
            'requirements': requirements,
            'status': 'pending'
        })

    def build_task(self, task_name, priority='medium'):
        return self.send_to_category('build', {
            'task': task_name,
            'priority': priority,
            'assigned': 'development_team'
        })

    def bug_report(self, description, severity='medium'):
        return self.send_to_category('bug', {
            'description': description,
            'severity': severity,
            'status': 'open'
        })

# Usage Example
router = NotionWebhookRouter("YOUR_WEBHOOK_URL_HERE")

# Send different types of data
router.mission_control("Launch new feature", "Complete user onboarding flow")
router.build_task("Fix login bug", "high")
router.bug_report("Button not working on mobile", "high")
```

### JavaScript/Node.js Implementation
```javascript
class NotionWebhookRouter {
    constructor(webhookUrl) {
        this.webhookUrl = webhookUrl;
    }

    async sendToCategory(category, data) {
        const response = await fetch(this.webhookUrl, {
            method: 'POST',
            headers: {
                'category': category,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        return response;
    }

    async missionControl(title, content) {
        return this.sendToCategory('mission', {
            title,
            content,
            timestamp: new Date().toISOString()
        });
    }

    async designBrief(projectName, requirements) {
        return this.sendToCategory('design-brief', {
            project: projectName,
            requirements,
            status: 'pending'
        });
    }

    async buildTask(taskName, priority = 'medium') {
        return this.sendToCategory('build', {
            task: taskName,
            priority,
            assigned: 'development_team'
        });
    }

    async contentLibrary(title, content, tags = []) {
        return this.sendToCategory('content', {
            title,
            content,
            tags,
            created_at: new Date().toISOString()
        });
    }
}

// Usage
const router = new NotionWebhookRouter('YOUR_WEBHOOK_URL_HERE');

// Examples
await router.missionControl('Q4 Goals', 'Increase user engagement by 25%');
await router.buildTask('Implement dark mode', 'high');
await router.contentLibrary('API Documentation', 'Updated REST API docs', ['api', 'docs']);
```

## 🤖 Claude AI Integration
If you're using Claude AI to generate webhook requests:

```python
# Claude AI Prompt Helper
def generate_claude_webhook_prompt(category, context):
    prompts = {
        'mission': f"Generate a mission control update for: {context}",
        'design-brief': f"Create a design brief for: {context}",
        'build': f"Generate build tasks for: {context}",
        'design-system': f"Create design system updates for: {context}",
        'content': f"Generate content library entry for: {context}",
        'bug': f"Create bug report for: {context}"
    }

    return f"""
    Please generate structured data for a {category} entry:
    Context: {context}

    Format the response as JSON that will be sent to a webhook with category: {category}
    Include relevant fields like title, description, priority, etc.
    """

# Example usage with Claude
claude_prompt = generate_claude_webhook_prompt('build', 'user authentication system')
# Send this prompt to Claude, then use the response with your webhook
```

## 🔄 Webhook Data Flow
1. Data arrives at your webhook URL with category header
2. Router analyzes the category header value
3. Path selection happens based on keyword matching:
   - Contains "mission" → Mission Control path
   - Contains "design-brief" → Design Briefs path
   - Contains "build" → Build Tasks path
   - etc.
4. Content formatting converts webhook body to Markdown
5. Notion update appends content to the target page

## 📝 Best Practices
- **Consistent Headers**: Always include the category header
- **Structured Data**: Send well-formatted JSON for better Notion display
- **Error Handling**: Check webhook responses for successful delivery
- **Testing**: Start with simple payloads to verify routing

## 🚀 Advanced Usage

### Batch Updates
```python
# Send multiple updates at once
updates = [
    ('mission', {'title': 'Sprint Review', 'content': 'Completed 15 tasks'}),
    ('build', {'task': 'Deploy to staging', 'priority': 'high'}),
    ('bug', {'issue': 'Mobile scroll issue', 'severity': 'medium'})
]

for category, data in updates:
    router.send_to_category(category, data)
```

### Dynamic Category Selection
```python
def smart_categorize(content):
    """Auto-detect category based on content"""
    keywords = {
        'mission': ['goal', 'objective', 'strategy', 'planning'],
        'build': ['implement', 'develop', 'code', 'feature'],
        'bug': ['error', 'issue', 'broken', 'fix'],
        'design-brief': ['design', 'mockup', 'wireframe', 'ui'],
        'content': ['documentation', 'guide', 'article'],
        'design-system': ['component', 'pattern', 'style']
    }

    content_lower = content.lower()
    for category, words in keywords.items():
        if any(word in content_lower for word in words):
            return category

    return 'mission'  # default fallback

# Usage
content = "Fix the login button bug on mobile"
category = smart_categorize(content)  # Returns 'bug'
router.send_to_category(category, {'content': content})
```

Your smart webhook routing system is now fully documented and ready for integration with any application or AI system like Claude!
