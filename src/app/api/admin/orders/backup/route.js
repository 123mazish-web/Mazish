import fs from 'fs'
import path from 'path'

const BACKUP_FILE_PATH = path.join(process.cwd(), 'orders_backup.json')

// Helper to safely read backup file
function readBackupFile() {
  try {
    if (!fs.existsSync(BACKUP_FILE_PATH)) {
      return []
    }
    const content = fs.readFileSync(BACKUP_FILE_PATH, 'utf8')
    return JSON.parse(content || '[]')
  } catch (e) {
    console.error("Failed to read backup file:", e)
    return []
  }
}

// Helper to safely write backup file
function writeBackupFile(data) {
  try {
    fs.writeFileSync(BACKUP_FILE_PATH, JSON.stringify(data, null, 2), 'utf8')
    return true
  } catch (e) {
    console.error("Failed to write backup file:", e)
    return false
  }
}

export async function GET(req) {
  try {
    const backupOrders = readBackupFile()
    return Response.json({ success: true, data: backupOrders })
  } catch (err) {
    console.error("Backup GET API error:", err)
    return Response.json({ success: false, error: err.message }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    const orderData = await req.json()
    
    if (!orderData || !orderData.customer_name || !orderData.phone) {
      return Response.json({ success: false, error: 'Invalid order payload' }, { status: 400 })
    }

    const backupOrders = readBackupFile()
    
    // Check if order already exists in backup to prevent duplicates
    const idToUse = orderData.id || `backup-${Date.now()}`
    const exists = backupOrders.find(o => o.id === idToUse)
    
    if (!exists) {
      const newBackupEntry = {
        id: idToUse,
        ...orderData,
        backup_created_at: new Date().toISOString()
      }
      backupOrders.unshift(newBackupEntry)
      writeBackupFile(backupOrders)
    }

    return Response.json({ success: true, message: 'Order successfully backed up to server disk' })
  } catch (err) {
    console.error("Backup POST API error:", err)
    return Response.json({ success: false, error: err.message }, { status: 500 })
  }
}
