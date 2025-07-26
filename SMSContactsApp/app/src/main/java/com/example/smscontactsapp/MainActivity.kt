package com.example.smscontactsapp

import android.Manifest
import android.content.pm.PackageManager
import android.database.Cursor
import android.net.Uri
import android.os.Bundle
import android.provider.ContactsContract
import android.provider.Telephony
import android.widget.Button
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat

/**
 * MainActivity - Main activity for SMS and Contacts Reader App
 * 
 * This app demonstrates how to:
 * 1. Request runtime permissions for SMS and Contacts access
 * 2. Read SMS messages from device
 * 3. Read contacts from device
 * 
 * IMPORTANT NOTES:
 * - User must grant permissions at runtime (Android 6.0+)
 * - This app is for educational purposes only
 * - Always respect user privacy and data protection laws
 */
class MainActivity : AppCompatActivity() {

    // Permission request codes
    companion object {
        private const val PERMISSION_REQUEST_CODE = 123
        private const val SMS_PERMISSION = Manifest.permission.READ_SMS
        private const val CONTACTS_PERMISSION = Manifest.permission.READ_CONTACTS
    }

    // UI elements
    private lateinit var btnReadSMS: Button
    private lateinit var btnReadContacts: Button
    private lateinit var btnRequestPermissions: Button
    private lateinit var tvOutput: TextView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        // Initialize UI elements
        initializeViews()
        
        // Set up click listeners
        setupClickListeners()
        
        // Check if permissions are already granted
        checkPermissions()
    }

    /**
     * Initialize all UI elements
     */
    private fun initializeViews() {
        btnReadSMS = findViewById(R.id.btnReadSMS)
        btnReadContacts = findViewById(R.id.btnReadContacts)
        btnRequestPermissions = findViewById(R.id.btnRequestPermissions)
        tvOutput = findViewById(R.id.tvOutput)
    }

    /**
     * Set up click listeners for buttons
     */
    private fun setupClickListeners() {
        // Button to request permissions
        btnRequestPermissions.setOnClickListener {
            requestPermissions()
        }

        // Button to read SMS messages
        btnReadSMS.setOnClickListener {
            if (checkPermission(SMS_PERMISSION)) {
                readSMSMessages()
            } else {
                Toast.makeText(this, "SMS permission not granted!", Toast.LENGTH_SHORT).show()
            }
        }

        // Button to read contacts
        btnReadContacts.setOnClickListener {
            if (checkPermission(CONTACTS_PERMISSION)) {
                readContacts()
            } else {
                Toast.makeText(this, "Contacts permission not granted!", Toast.LENGTH_SHORT).show()
            }
        }
    }

    /**
     * Check if required permissions are granted
     */
    private fun checkPermissions() {
        val smsGranted = checkPermission(SMS_PERMISSION)
        val contactsGranted = checkPermission(CONTACTS_PERMISSION)

        if (smsGranted && contactsGranted) {
            tvOutput.text = "All permissions granted! You can now read SMS and Contacts."
            enableButtons(true)
        } else {
            tvOutput.text = "Permissions required! Click 'Request Permissions' button."
            enableButtons(false)
        }
    }

    /**
     * Check if a specific permission is granted
     */
    private fun checkPermission(permission: String): Boolean {
        return ContextCompat.checkSelfPermission(this, permission) == PackageManager.PERMISSION_GRANTED
    }

    /**
     * Request required permissions from user
     */
    private fun requestPermissions() {
        val permissions = arrayOf(SMS_PERMISSION, CONTACTS_PERMISSION)
        
        ActivityCompat.requestPermissions(
            this,
            permissions,
            PERMISSION_REQUEST_CODE
        )
    }

    /**
     * Handle permission request result
     */
    override fun onRequestPermissionsResult(
        requestCode: Int,
        permissions: Array<out String>,
        grantResults: IntArray
    ) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)

        if (requestCode == PERMISSION_REQUEST_CODE) {
            if (grantResults.isNotEmpty() && grantResults.all { it == PackageManager.PERMISSION_GRANTED }) {
                Toast.makeText(this, "All permissions granted!", Toast.LENGTH_SHORT).show()
                tvOutput.text = "All permissions granted! You can now read SMS and Contacts."
                enableButtons(true)
            } else {
                Toast.makeText(this, "Permissions denied! App cannot function properly.", Toast.LENGTH_LONG).show()
                tvOutput.text = "Permissions denied! Please grant permissions in Settings."
                enableButtons(false)
            }
        }
    }

    /**
     * Enable or disable buttons based on permission status
     */
    private fun enableButtons(enable: Boolean) {
        btnReadSMS.isEnabled = enable
        btnReadContacts.isEnabled = enable
    }

    /**
     * Read SMS messages from device
     * 
     * This method reads SMS messages from the device's SMS database
     * and displays them in the TextView
     */
    private fun readSMSMessages() {
        try {
            val smsList = mutableListOf<String>()
            
            // Query SMS messages from content provider
            val cursor: Cursor? = contentResolver.query(
                Uri.parse("content://sms/inbox"), // Read inbox messages
                null, // All columns
                null, // No selection
                null, // No selection args
                "date DESC" // Sort by date, newest first
            )

            cursor?.use { 
                val bodyIndex = it.getColumnIndex("body")
                val addressIndex = it.getColumnIndex("address")
                val dateIndex = it.getColumnIndex("date")

                var count = 0
                while (it.moveToNext() && count < 10) { // Limit to 10 messages for demo
                    val body = it.getString(bodyIndex) ?: "No body"
                    val address = it.getString(addressIndex) ?: "Unknown"
                    val date = it.getLong(dateIndex)
                    
                    val messageInfo = """
                        From: $address
                        Message: ${body.take(50)}${if (body.length > 50) "..." else ""}
                        Date: ${java.util.Date(date)}
                        ----------------------
                    """.trimIndent()
                    
                    smsList.add(messageInfo)
                    count++
                }
            }

            // Display results
            if (smsList.isNotEmpty()) {
                tvOutput.text = "SMS Messages:\n\n${smsList.joinToString("\n")}"
            } else {
                tvOutput.text = "No SMS messages found or permission denied."
            }

        } catch (e: Exception) {
            tvOutput.text = "Error reading SMS: ${e.message}"
            e.printStackTrace()
        }
    }

    /**
     * Read contacts from device
     * 
     * This method reads contacts from the device's contacts database
     * and displays them in the TextView
     */
    private fun readContacts() {
        try {
            val contactsList = mutableListOf<String>()
            
            // Query contacts from content provider
            val cursor: Cursor? = contentResolver.query(
                ContactsContract.CommonDataKinds.Phone.CONTENT_URI,
                null, // All columns
                null, // No selection
                null, // No selection args
                ContactsContract.CommonDataKinds.Phone.DISPLAY_NAME + " ASC" // Sort by name
            )

            cursor?.use { 
                val nameIndex = it.getColumnIndex(ContactsContract.CommonDataKinds.Phone.DISPLAY_NAME)
                val numberIndex = it.getColumnIndex(ContactsContract.CommonDataKinds.Phone.NUMBER)

                var count = 0
                while (it.moveToNext() && count < 20) { // Limit to 20 contacts for demo
                    val name = it.getString(nameIndex) ?: "Unknown"
                    val number = it.getString(numberIndex) ?: "No number"
                    
                    val contactInfo = """
                        Name: $name
                        Number: $number
                        ----------------------
                    """.trimIndent()
                    
                    contactsList.add(contactInfo)
                    count++
                }
            }

            // Display results
            if (contactsList.isNotEmpty()) {
                tvOutput.text = "Contacts:\n\n${contactsList.joinToString("\n")}"
            } else {
                tvOutput.text = "No contacts found or permission denied."
            }

        } catch (e: Exception) {
            tvOutput.text = "Error reading contacts: ${e.message}"
            e.printStackTrace()
        }
    }
}