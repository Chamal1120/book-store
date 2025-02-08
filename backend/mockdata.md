## Use following commands to insert mock data into the DynamoDB table using AWS CLI

aws dynamodb put-item --table-name books --item '{
    "isbn": {"S": "9780545069670"},
    "book_id": {"S": "OL30546665M"},
    "title": {"S": "Harry Potter and the Sorcerer'\''s Stone, 10th Anniversary Edition"},
    "description": {"S": "A special 10th Anniversary Edition of the beloved first book in the Harry Potter series by J.K. Rowling."},
    "author": {"S": "J. K. Rowling"},
    "price": {"N": "20"},
    "cover_path": {"S": "https://covers.openlibrary.org/b/id/10469774-S.jpg"}
}'

aws dynamodb put-item --table-name books --item '{
    "isbn": {"S": "9780007459483"},
    "book_id": {"S": "OL27264224M"},
    "title": {"S": "A Game of Thrones"},
    "description": {"S": "The first book in the epic fantasy series A Song of Ice and Fire by George R. R. Martin."},
    "author": {"S": "George R. R. Martin"},
    "price": {"N": "25"},
    "cover_path": {"S": "https://covers.openlibrary.org/b/id/8753464-S.jpg"}
}'

aws dynamodb put-item --table-name books --item '{
    "isbn": {"S": "9781408806593"},
    "book_id": {"S": "OL28414930M"},
    "title": {"S": "Paper Towns"},
    "description": {"S": "One month before graduating, Quentin embarks on an adventure after his mysterious neighbor, Margo, suddenly disappears."},
    "author": {"S": "John Green"},
    "price": {"N": "15"},
    "cover_path": {"S": "https://covers.openlibrary.org/b/id/10315202-S.jpg"}
}'

 ~ 
➜ aws dynamodb put-item --table-name books --item '{
    "isbn": {"S": "9780142424179"},
    "book_id": {"S": "OL25607762M"},
    "title": {"S": "The Fault in Our Stars"},
    "description": {"S": "A heartbreaking and insightful story about a young girl diagnosed with cancer, who finds love and purpose in unexpected places."},
    "author": {"S": "John Green"},
    "price": {"N": "18"},
    "cover_path": {"S": "https://covers.openlibrary.org/b/id/7285167-S.jpg"}
}'

 ~ 
 aws dynamodb put-item --table-name books --item '{
    "isbn": {"S": "9781408806593"},
    "book_id": {"S": "OL28414930M"},
    "title": {"S": "Paper Towns"},           
    "description": {"S": "One month before graduating, Quentin embarks on an adventure after his mysterious neighbor, Margo, suddenly disappears."},        
    "author": {"S": "John Green"},
    "price": {"N": "15"},
    "cover_path": {"S": "https://covers.openlibrary.org/b/id/10315202-S.jpg"}
}'

aws dynamodb put-item --table-name books --item '{
    "isbn": {"S": "9780140430547"},
    "book_id": {"S": "OL43720887M"},
    "title": {"S": "A Tale of Two Cities"},           
    "description": {"S": "This stirring tale of resurrection, renunciation and revolution is one of Dickens'\''s best and most popular novels."},        
    "author": {"S": "Charles Dickens"},
    "price": {"N": "15"},
    "cover_path": {"S": "https://covers.openlibrary.org/b/id/13029792-S.jpg"}
}'

aws dynamodb put-item --table-name books --item '{
    "isbn": {"S": "9780385513227"},
    "book_id": {"S": "OL26344164M"},
    "title": {"S": "The Da Vinci Code"},           
    "description": {"S": "Harvard symbologist Robert Langdon is awakened by a phone call in the dead of the night. The elderly curator of the Louvre has been murdered, his body covered in baffling symbols."},        
    "author": {"S": "Dan Brown"},
    "price": {"N": "18"},
    "cover_path": {"S": "https://covers.openlibrary.org/b/id/8231839-S.jpg"}
}'

aws dynamodb put-item --table-name books --item '{
    "isbn": {"S": "9780261102217"},
    "book_id": {"S": "OL37509862M"},
    "title": {"S": "The Hobbit"},           
    "description": {"S": "The adventure of Bilbo Baggins as he journeys through Middle-earth, encountering dragons, dwarves, and magic."},        
    "author": {"S": "J.R.R. Tolkien"},
    "price": {"N": "20"},
    "cover_path": {"S": "https://covers.openlibrary.org/b/id/12649317-S.jpg"}
}'

aws dynamodb put-item --table-name books --item '{
    "isbn": {"S": "9780007105007"},
    "book_id": {"S": "OL44099744M"},
    "title": {"S": "Lord of the Rings"},           
    "description": {"S": "An epic fantasy novel that follows the journey of Frodo Baggins as he sets out to destroy the One Ring."},        
    "author": {"S": "J.R.R. Tolkien"},
    "price": {"N": "25"},
    "cover_path": {"S": "https://covers.openlibrary.org/b/id/12649317-S.jpg"}
}'

aws dynamodb put-item --table-name books --item '{
    "isbn": {"S": "9780316038379"},
    "book_id": {"S": "OL37073274M"},
    "title": {"S": "Twilight"},           
    "description": {"S": "The story of Bella Swan, a teenager who falls in love with a vampire, Edward Cullen."},        
    "author": {"S": "Stephenie Meyer"},
    "price": {"N": "12"},
    "cover_path": {"S": "https://covers.openlibrary.org/b/id/12642035-S.jpg"}
}'

aws dynamodb put-item --table-name books --item '{
    "isbn": {"S": "9780061963865"},
    "book_id": {"S": "OL26194608M"},
    "title": {"S": "The Vampire Diaries: The Awakening"},           
    "description": {"S": "The story of Elena Gilbert, a high school girl caught in a love triangle with two vampire brothers."},        
    "author": {"S": "L.J. Smith"},
    "price": {"N": "10"},
    "cover_path": {"S": "https://covers.openlibrary.org/b/id/7878989-S.jpg"}
}'

