import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

# Load the data
file_path = 'video_result.csv'  # Replace with your actual file path
data = pd.read_csv(file_path)

# Setting up the aesthetics for the plots
sns.set(style="whitegrid")

# Select a subset of data for labeling (e.g., top 50 by view count for correlation plot)
label_data = data.nlargest(50, 'ViewCount')

# Analysis 1: Relationship between view counts and like counts of videos with labels
plt.figure(figsize=(12, 8))
sns.scatterplot(data=data, x='ViewCount', y='LikeCount')
plt.title('Relationship between Video View Counts and Like Counts')
plt.xlabel('View Count')
plt.ylabel('Like Count')
plt.xscale('log')
plt.yscale('log')

# Adding labels
for i in range(label_data.shape[0]):
    plt.text(x=label_data['ViewCount'].iloc[i], y=label_data['LikeCount'].iloc[i],
             s=label_data['ChannelTitle'].iloc[i],
             fontdict=dict(color='red',size=8),
             bbox=dict(facecolor='yellow',alpha=0.5))

plt.tight_layout()
plt.savefig('view_like_relationship_with_labels.png')
plt.close()

# Analysis 2: Distribution of subscriber counts
bar_data = data.nlargest(20, 'SubscriberCount')
plt.figure(figsize=(12, 8))
sns.barplot(data=bar_data, x='SubscriberCount', y='ChannelTitle')
plt.title('Subscriber Counts for Top Channels')
plt.xlabel('Subscriber Count')
plt.ylabel('Channel Title')
plt.xscale('log')

# Rotate labels for clarity
plt.xticks(rotation=45)
plt.tight_layout()
plt.savefig('subscriber_count_bar_chart.png')
plt.close()


# Analysis 3: Correlation between video view counts and channel view counts with labels
plt.figure(figsize=(12, 8))
sns.scatterplot(data=data, x='ViewCount', y='ViewCCount')
plt.title('Correlation between Video View Counts and Channel View Counts')
plt.xlabel('Video View Count')
plt.ylabel('Channel View Count')
plt.xscale('log')
plt.yscale('log')

# Adding labels
for i in range(label_data.shape[0]):
    plt.text(x=label_data['ViewCount'].iloc[i], y=label_data['ViewCCount'].iloc[i],
             s=label_data['ChannelTitle'].iloc[i],
             fontdict=dict(color='green',size=8),
             bbox=dict(facecolor='yellow',alpha=0.5))

plt.tight_layout()
plt.savefig('video_channel_view_correlation_with_labels.png')
plt.close()
